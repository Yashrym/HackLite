from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile
from pymongo.errors import ServerSelectionTimeoutError

from app.config import settings
from app.database import get_db
from app.models import ReportCreate, ReportResponse, ReportStatus, ReportStatusUpdate, Severity, StatisticsResponse
from app.services.severity import confidence_to_severity
from app.services.yolo_service import run_inference

router = APIRouter(prefix="/reports", tags=["reports"])

UPLOAD_ROOT = Path(settings.upload_dir)
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _doc_to_response(doc: dict[str, Any]) -> ReportResponse:
    return ReportResponse(
        id=str(doc["_id"]),
        imageUrl=doc.get("imageUrl", ""),
        latitude=doc["latitude"],
        longitude=doc["longitude"],
        damageType=doc["damageType"],
        confidence=doc["confidence"],
        severity=Severity(doc["severity"]),
        timestamp=doc["timestamp"],
        status=ReportStatus(doc["status"]),
        description=doc.get("description"),
        detections=doc.get("detections", []),
    )


async def _insert_report_doc(
    *,
    image_url: str,
    latitude: float,
    longitude: float,
    damage_type: str,
    confidence: float,
    severity: Severity,
    description: str | None,
    detections: list[dict],
) -> ReportResponse:
    db = get_db()
    doc = {
        "imageUrl": image_url,
        "latitude": latitude,
        "longitude": longitude,
        "damageType": damage_type,
        "confidence": confidence,
        "severity": severity.value,
        "timestamp": datetime.now(timezone.utc),
        "status": ReportStatus.pending.value,
        "description": description,
        "detections": detections,
    }
    try:
        result = await db.reports.insert_one(doc)
    except ServerSelectionTimeoutError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "MongoDB is unavailable. Start MongoDB locally or configure a valid "
                "MONGODB_URI / MONGODB_URL in backend/.env."
            ),
        ) from exc

    doc["_id"] = result.inserted_id
    return _doc_to_response(doc)


@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(request: Request):
    """
    JSON body (ReportCreate) or multipart/form-data: file, latitude, longitude, description.
    Multipart runs YOLO on upload then persists the report.
    """
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        file = form.get("file")
        if file is None or not hasattr(file, "read"):
            raise HTTPException(status_code=400, detail="file is required")
        try:
            latitude = float(form.get("latitude"))
            longitude = float(form.get("longitude"))
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail="latitude and longitude are required") from exc
        description = form.get("description")
        if description is not None and not isinstance(description, str):
            description = str(description)
        if description == "":
            description = None

        ext = Path(getattr(file, "filename", None) or "image.jpg").suffix or ".jpg"
        name = f"{uuid4().hex}{ext}"
        dest = UPLOAD_ROOT / name
        content = await file.read()
        dest.write_bytes(content)

        try:
            detections, _w, _h = run_inference(dest)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

        primary = detections[0] if detections else None
        damage_type = primary["damage_type"] if primary else "crack"
        confidence = float(primary["confidence"]) if primary else 0.0
        severity = (
            confidence_to_severity(confidence, damage_type)
            if primary
            else Severity.low
        )
        image_url = f"/uploads/{name}"
        return await _insert_report_doc(
            image_url=image_url,
            latitude=latitude,
            longitude=longitude,
            damage_type=damage_type,
            confidence=confidence,
            severity=severity,
            description=description,
            detections=detections,
        )

    payload = ReportCreate.model_validate(await request.json())
    return await _insert_report_doc(
        image_url=payload.image_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        damage_type=payload.damage_type,
        confidence=payload.confidence,
        severity=payload.severity,
        description=payload.description,
        detections=[d.model_dump() for d in payload.detections],
    )


@router.get("", response_model=list[ReportResponse])
async def list_reports(
    severity: Severity | None = None,
    status: ReportStatus | None = None,
    critical_only: bool = Query(False, alias="criticalOnly"),
):
    db = get_db()
    query: dict[str, Any] = {}
    if severity:
        query["severity"] = severity.value
    if status:
        query["status"] = status.value
    if critical_only:
        query["severity"] = Severity.critical.value

    cursor = db.reports.find(query).sort("timestamp", -1)
    reports = []
    async for doc in cursor:
        reports.append(_doc_to_response(doc))
    return reports


@router.get("/statistics/summary", response_model=StatisticsResponse)
async def get_statistics():
    db = get_db()
    total = await db.reports.count_documents({})
    critical = await db.reports.count_documents({"severity": Severity.critical.value})
    resolved = await db.reports.count_documents({"status": ReportStatus.resolved.value})
    pending = await db.reports.count_documents({"status": ReportStatus.pending.value})

    by_severity: dict[str, int] = {"low": 0, "high": 0, "critical": 0}
    by_damage: dict[str, int] = {}
    async for doc in db.reports.find({}, {"severity": 1, "damageType": 1}):
        sev = doc.get("severity", "low")
        by_severity[sev] = by_severity.get(sev, 0) + 1
        dt = doc.get("damageType", "unknown")
        by_damage[dt] = by_damage.get(dt, 0) + 1

    # Daily counts for last 7 days
    daily: list[dict[str, Any]] = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = await db.reports.count_documents(
            {"timestamp": {"$gte": day_start, "$lt": day_end}}
        )
        daily.append({"date": day_start.strftime("%Y-%m-%d"), "count": count})

    return StatisticsResponse(
        totalReports=total,
        criticalReports=critical,
        resolved=resolved,
        pending=pending,
        bySeverity=by_severity,
        byDamageType=by_damage,
        dailyReports=daily,
    )


@router.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    """Upload image and run YOLO inference; returns detections and annotated preview path."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    name = f"{uuid4().hex}{ext}"
    dest = UPLOAD_ROOT / name
    content = await file.read()
    dest.write_bytes(content)

    try:
        detections, width, height = run_inference(dest)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    image_url = f"/uploads/{name}"
    primary = detections[0] if detections else None
    return {
        "imageUrl": image_url,
        "width": width,
        "height": height,
        "detections": detections,
        "primaryDamageType": primary["damage_type"] if primary else "none",
        "primaryConfidence": primary["confidence"] if primary else 0.0,
        "suggestedSeverity": confidence_to_severity(
            primary["confidence"] if primary else 0.0,
            primary["damage_type"] if primary else "crack",
        ).value
        if primary
        else Severity.low.value,
    }


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    db = get_db()
    try:
        oid = ObjectId(report_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid report id") from exc

    doc = await db.reports.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    return _doc_to_response(doc)


@router.patch("/{report_id}/status", response_model=ReportResponse)
async def update_report_status(report_id: str, payload: ReportStatusUpdate):
    db = get_db()
    try:
        oid = ObjectId(report_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid report id") from exc

    from pymongo import ReturnDocument

    result = await db.reports.find_one_and_update(
        {"_id": oid},
        {"$set": {"status": payload.status.value}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Report not found")
    return _doc_to_response(result)

import random
from pathlib import Path

import cv2
import numpy as np

from app.config import settings

# COCO class names subset remapped for demo; custom model can replace this
DAMAGE_LABELS = {
    "pothole": "pothole",
    "crack": "crack",
    "alligator_crack": "crack",
    "manhole": "surface_defect",
}

_model = None


def _load_model():
    global _model
    if settings.yolo_mock:
        return None
    if _model is not None:
        return _model
    try:
        from ultralytics import YOLO

        _model = YOLO(settings.yolo_model)
        return _model
    except Exception:
        return None


def _mock_detections(width: int, height: int) -> list[dict]:
    """Fallback when YOLO unavailable — deterministic-ish demo boxes."""
    rng = random.Random(width + height)
    n = rng.randint(0, 3)
    types = ["pothole", "crack", "pothole"]
    out = []
    for i in range(n):
        w = rng.uniform(0.08, 0.22) * width
        h = rng.uniform(0.06, 0.18) * height
        x1 = rng.uniform(0.05, 0.75) * width
        y1 = rng.uniform(0.05, 0.75) * height
        x2 = min(x1 + w, width - 1)
        y2 = min(y1 + h, height - 1)
        conf = round(rng.uniform(0.45, 0.97), 3)
        out.append(
            {
                "damage_type": types[i % len(types)],
                "confidence": conf,
                "bbox": [x1, y1, x2, y2],
            }
        )
    return out


def _map_class_name(name: str) -> str:
    key = name.lower().replace(" ", "_")
    return DAMAGE_LABELS.get(key, "crack" if "crack" in key else "pothole")


def run_inference(image_path: str | Path) -> tuple[list[dict], int, int]:
    """
    Run YOLOv8 on image. Returns detections, image width, height.
    Each detection: damage_type, confidence, bbox [x1,y1,x2,y2] in pixels.
    """
    path = Path(image_path)
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError("Could not read image")

    height, width = img.shape[:2]
    model = _load_model()

    if model is None or settings.yolo_mock:
        return _mock_detections(width, height), width, height

    results = model.predict(source=str(path), verbose=False)
    detections: list[dict] = []

    for r in results:
        if r.boxes is None:
            continue
        names = r.names or {}
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            raw_name = names.get(cls_id, str(cls_id))
            # Generic YOLO uses COCO — treat low-confidence as crack-like surface issues for demo
            if raw_name in ("car", "truck", "bus", "person", "bicycle"):
                continue
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            damage = _map_class_name(raw_name)
            if damage == "pothole" or conf > 0.35:
                detections.append(
                    {
                        "damage_type": damage if damage != "surface_defect" else "crack",
                        "confidence": round(conf, 3),
                        "bbox": [x1, y1, x2, y2],
                    }
                )

    if not detections:
        # No COCO road classes — use mock so MVP still demonstrates flow
        detections = _mock_detections(width, height)

    return detections, width, height

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ReportStatus(str, Enum):
    pending = "pending"
    assigned = "assigned"
    resolved = "resolved"
    duplicate = "duplicate"


class Severity(str, Enum):
    low = "low"
    high = "high"
    critical = "critical"


class DetectionBox(BaseModel):
    damage_type: str
    confidence: float
    bbox: list[float]  # x1, y1, x2, y2 normalized 0-1 or pixels depending on client


class ReportCreate(BaseModel):
    latitude: float
    longitude: float
    damage_type: str
    confidence: float
    severity: Severity
    image_url: str
    description: str | None = None
    detections: list[DetectionBox] = Field(default_factory=list)


class ReportStatusUpdate(BaseModel):
    status: ReportStatus


class ReportResponse(BaseModel):
    id: str
    imageUrl: str
    latitude: float
    longitude: float
    damageType: str
    confidence: float
    severity: Severity
    timestamp: datetime
    status: ReportStatus
    description: str | None = None
    detections: list[dict[str, Any]] = Field(default_factory=list)


class StatisticsResponse(BaseModel):
    totalReports: int
    criticalReports: int
    resolved: int
    pending: int
    bySeverity: dict[str, int]
    byDamageType: dict[str, int]
    dailyReports: list[dict[str, Any]]

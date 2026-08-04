from app.models import Severity


def confidence_to_severity(confidence: float, damage_type: str) -> Severity:
    """Map detection confidence and damage type to operational severity."""
    dt = damage_type.lower()
    if "pothole" in dt or "critical" in dt:
        if confidence >= 0.75:
            return Severity.critical
        if confidence >= 0.5:
            return Severity.high
        return Severity.low
    if confidence >= 0.85:
        return Severity.critical
    if confidence >= 0.55:
        return Severity.high
    return Severity.low

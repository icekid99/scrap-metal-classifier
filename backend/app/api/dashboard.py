from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.user import User
from app.models.detection import Detection
from app.auth.jwt import get_current_user
from app.schemas.detection import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total = db.query(func.count(Detection.id)).scalar() or 0

    class_counts = (
        db.query(Detection.detected_class, func.count(Detection.id))
        .group_by(Detection.detected_class)
        .all()
    )
    counts = {row[0]: row[1] for row in class_counts}

    today = datetime.utcnow().date()
    today_count = (
        db.query(func.count(Detection.id))
        .filter(func.date(Detection.processed_at) == today)
        .scalar() or 0
    )

    week_start = datetime.utcnow() - timedelta(days=7)
    week_count = (
        db.query(func.count(Detection.id))
        .filter(Detection.processed_at >= week_start)
        .scalar() or 0
    )

    high_conf = (
        db.query(func.count(Detection.id))
        .filter(Detection.confidence >= 0.8)
        .scalar() or 0
    )
    accuracy = round((high_conf / total * 100) if total > 0 else 0.0, 1)

    return DashboardStats(
        total_detections=total,
        steel=counts.get("Steel", 0),
        cast_iron=counts.get("Cast Iron", 0),
        aluminium=counts.get("Aluminium", 0),
        copper=counts.get("Copper", 0),
        brass=counts.get("Brass", 0),
        lead=counts.get("Lead", 0),
        accuracy=accuracy,
        today_count=today_count,
        this_week_count=week_count,
    )


@router.get("/monthly")
def monthly_detections(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    results = (
        db.query(
            func.to_char(Detection.processed_at, "YYYY-MM").label("month"),
            func.count(Detection.id).label("count"),
        )
        .group_by("month")
        .order_by("month")
        .limit(12)
        .all()
    )
    return [{"month": r.month, "count": r.count} for r in results]


@router.get("/daily")
def daily_detections(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    since = datetime.utcnow() - timedelta(days=30)
    results = (
        db.query(
            func.date(Detection.processed_at).label("date"),
            func.count(Detection.id).label("count"),
        )
        .filter(Detection.processed_at >= since)
        .group_by(func.date(Detection.processed_at))
        .order_by(func.date(Detection.processed_at))
        .all()
    )
    return [{"date": str(r.date), "count": r.count} for r in results]

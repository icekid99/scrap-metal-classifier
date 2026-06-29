import csv
import io
import math
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.database import get_db
from app.models.user import User
from app.models.detection import Detection
from app.auth.jwt import get_current_user
from app.schemas.detection import DetectionListResponse, DetectionOut

router = APIRouter(prefix="/api/detections", tags=["Detections"])


@router.get("", response_model=DetectionListResponse)
def list_detections(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    metal_class: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Detection)

    if current_user.role.value == "operator":
        query = query.filter(Detection.operator_id == current_user.id)

    if search:
        query = query.filter(
            or_(
                Detection.image_name.ilike(f"%{search}%"),
                Detection.detected_class.ilike(f"%{search}%"),
            )
        )
    if metal_class:
        query = query.filter(Detection.detected_class == metal_class)

    total = query.count()
    total_pages = math.ceil(total / page_size)
    items = (
        query.order_by(Detection.processed_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    out = []
    for d in items:
        operator_name = d.operator.username if d.operator else None
        dto = DetectionOut(
            id=d.id,
            image_name=d.image_name,
            detected_class=d.detected_class,
            confidence=d.confidence,
            bounding_box=d.bounding_box,
            image_path=d.image_path,
            processed_image_path=d.processed_image_path,
            processed_at=d.processed_at,
            operator_id=d.operator_id,
            operator_name=operator_name,
            source=d.source,
        )
        out.append(dto)

    return DetectionListResponse(
        items=out, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Detection)
    if current_user.role.value == "operator":
        query = query.filter(Detection.operator_id == current_user.id)
    records = query.order_by(Detection.processed_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Image", "Class", "Confidence", "Date", "Source", "Operator"])
    for d in records:
        writer.writerow([
            d.id, d.image_name, d.detected_class,
            f"{d.confidence:.2%}", d.processed_at.isoformat(),
            d.source, d.operator.username if d.operator else "",
        ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=detections.csv"},
    )

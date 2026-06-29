import os
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.detection import Detection
from app.ai.predict import run_inference
from app.ai.camera_detection import process_webcam_frame
from app.ai.utils import load_image_from_bytes, save_image
from app.auth.jwt import get_current_user
from app.config import settings
from app.schemas.detection import DetectionResult, BoundingBox

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/detect", tags=["Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}


@router.post("/upload", response_model=DetectionResult)
async def upload_and_detect(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG, PNG, WEBP, or BMP.")

    data = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB.")

    image = load_image_from_bytes(data)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")

    unique = uuid.uuid4().hex
    original_ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    original_name = f"{unique}{original_ext}"
    processed_name = f"proc_{unique}.jpg"

    original_path = os.path.join(settings.UPLOAD_FOLDER, original_name)
    processed_path = os.path.join(settings.PROCESSED_FOLDER, processed_name)

    save_image(image, original_path)

    detected_class, confidence, boxes, annotated = run_inference(image)
    save_image(annotated, processed_path)

    record = Detection(
        image_name=file.filename or original_name,
        detected_class=detected_class,
        confidence=confidence,
        bounding_box=[b.model_dump() for b in boxes],
        image_path=original_path,
        processed_image_path=processed_path,
        operator_id=current_user.id,
        source="upload",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return DetectionResult(
        detected_class=detected_class,
        confidence=confidence,
        bounding_boxes=boxes,
        processed_image_url=f"/processed/{processed_name}",
        detection_id=record.id,
    )


@router.post("/webcam", response_model=DetectionResult)
async def webcam_detect(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    frame_data = payload.get("frame")
    if not frame_data:
        raise HTTPException(status_code=400, detail="No frame data provided")

    result = process_webcam_frame(frame_data)

    if "error" not in result:
        record = Detection(
            image_name=f"webcam_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg",
            detected_class=result["detected_class"],
            confidence=result["confidence"],
            bounding_box=result["bounding_boxes"],
            operator_id=current_user.id,
            source="webcam",
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        result["detection_id"] = record.id

    boxes = [BoundingBox(**b) for b in result.get("bounding_boxes", [])]
    return DetectionResult(
        detected_class=result["detected_class"],
        confidence=result["confidence"],
        bounding_boxes=boxes,
        detection_id=result.get("detection_id"),
    )


@router.websocket("/ws")
async def websocket_detect(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            frame_data = await websocket.receive_text()
            result = process_webcam_frame(frame_data)
            await websocket.send_json(result)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

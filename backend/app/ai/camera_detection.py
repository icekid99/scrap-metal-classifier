import base64
import logging
import numpy as np
from app.ai.predict import run_inference
from app.ai.utils import load_image_from_bytes, image_to_jpeg_bytes

logger = logging.getLogger(__name__)


def process_webcam_frame(frame_data: str) -> dict:
    """
    Process a base64-encoded webcam frame.
    Returns detection results with annotated frame.
    """
    try:
        header, encoded = frame_data.split(",", 1) if "," in frame_data else ("", frame_data)
        image_bytes = base64.b64decode(encoded)
        image = load_image_from_bytes(image_bytes)

        detected_class, confidence, boxes, annotated = run_inference(image)

        annotated_bytes = image_to_jpeg_bytes(annotated)
        annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(annotated_bytes).decode()

        return {
            "detected_class": detected_class,
            "confidence": round(confidence, 4),
            "bounding_boxes": [b.model_dump() for b in boxes],
            "annotated_frame": annotated_b64,
        }
    except Exception as e:
        logger.error(f"Webcam frame processing failed: {e}")
        return {
            "detected_class": "Error",
            "confidence": 0.0,
            "bounding_boxes": [],
            "annotated_frame": None,
            "error": str(e),
        }

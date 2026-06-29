import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

SCRAP_CLASSES = ["Steel", "Cast Iron", "Aluminium", "Copper", "Brass", "Lead"]

_model = None


def load_model(model_path: str = "best.pt"):
    global _model
    if _model is not None:
        return _model

    path = Path(model_path)
    if not path.exists():
        logger.warning(
            f"Model file '{model_path}' not found. "
            "Running in DEMO mode — predictions will be simulated. "
            "Place your trained best.pt in the backend/ folder to enable real inference."
        )
        _model = None
        return None

    try:
        from ultralytics import YOLO
        _model = YOLO(str(path))
        logger.info(f"YOLOv8 model loaded from {model_path}")
        return _model
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        _model = None
        return None


def get_model():
    return _model


def get_classes():
    return SCRAP_CLASSES

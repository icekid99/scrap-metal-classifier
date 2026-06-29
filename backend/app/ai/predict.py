import random
import logging
import numpy as np
from typing import List, Tuple
from app.ai.model_loader import get_model, get_classes, SCRAP_CLASSES
from app.ai.utils import draw_bounding_boxes
from app.schemas.detection import BoundingBox
from app.config import settings

logger = logging.getLogger(__name__)


def _demo_predict(image: np.ndarray) -> Tuple[str, float, List[BoundingBox]]:
    """Simulated prediction used when best.pt is not present."""
    h, w = image.shape[:2]
    chosen_class = random.choice(SCRAP_CLASSES)
    confidence = round(random.uniform(0.72, 0.98), 4)
    x1 = random.randint(0, w // 3)
    y1 = random.randint(0, h // 3)
    x2 = random.randint(w // 2, w - 1)
    y2 = random.randint(h // 2, h - 1)
    boxes = [BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, label=chosen_class, confidence=confidence)]
    return chosen_class, confidence, boxes


def run_inference(image: np.ndarray) -> Tuple[str, float, List[BoundingBox], np.ndarray]:
    model = get_model()

    if model is None:
        logger.debug("Demo mode — simulating prediction")
        detected_class, confidence, boxes = _demo_predict(image)
        annotated = draw_bounding_boxes(image, boxes)
        return detected_class, confidence, boxes, annotated

    results = model(image, conf=settings.CONFIDENCE_THRESHOLD, verbose=False)
    boxes: List[BoundingBox] = []
    best_class = "Unknown"
    best_conf = 0.0

    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            classes = get_classes()
            label = classes[cls_id] if cls_id < len(classes) else f"class_{cls_id}"
            b = BoundingBox(x1=xyxy[0], y1=xyxy[1], x2=xyxy[2], y2=xyxy[3], label=label, confidence=conf)
            boxes.append(b)
            if conf > best_conf:
                best_conf = conf
                best_class = label

    annotated = draw_bounding_boxes(image, boxes)
    return best_class, best_conf, boxes, annotated

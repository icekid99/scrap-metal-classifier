import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple
from app.schemas.detection import BoundingBox

COLORS = {
    "Steel": (100, 149, 237),
    "Cast Iron": (128, 128, 128),
    "Aluminium": (192, 192, 192),
    "Copper": (184, 115, 51),
    "Brass": (181, 166, 66),
    "Lead": (119, 118, 150),
}


def draw_bounding_boxes(image: np.ndarray, boxes: List[BoundingBox]) -> np.ndarray:
    annotated = image.copy()
    for box in boxes:
        color = COLORS.get(box.label, (0, 255, 0))
        x1, y1, x2, y2 = int(box.x1), int(box.y1), int(box.x2), int(box.y2)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        label_text = f"{box.label} {box.confidence:.0%}"
        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(annotated, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
        cv2.putText(annotated, label_text, (x1 + 2, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    return annotated


def save_image(image: np.ndarray, path: str) -> str:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(path, image)
    return path


def load_image_from_bytes(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def resize_for_inference(image: np.ndarray, size: int = 640) -> np.ndarray:
    h, w = image.shape[:2]
    scale = size / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(image, (new_w, new_h))


def image_to_jpeg_bytes(image: np.ndarray) -> bytes:
    _, buffer = cv2.imencode(".jpg", image)
    return buffer.tobytes()

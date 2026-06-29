from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    label: str
    confidence: float


class DetectionResult(BaseModel):
    detected_class: str
    confidence: float
    bounding_boxes: List[BoundingBox]
    processed_image_url: Optional[str] = None
    detection_id: Optional[int] = None


class DetectionOut(BaseModel):
    id: int
    image_name: str
    detected_class: str
    confidence: float
    bounding_box: Optional[Any] = None
    image_path: Optional[str] = None
    processed_image_path: Optional[str] = None
    processed_at: datetime
    operator_id: Optional[int] = None
    operator_name: Optional[str] = None
    source: str

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_detections: int
    steel: int
    cast_iron: int
    aluminium: int
    copper: int
    brass: int
    lead: int
    accuracy: float
    today_count: int
    this_week_count: int


class DetectionListResponse(BaseModel):
    items: List[DetectionOut]
    total: int
    page: int
    page_size: int
    total_pages: int

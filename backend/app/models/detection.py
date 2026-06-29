from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String(255), nullable=False)
    detected_class = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    bounding_box = Column(JSON, nullable=True)
    image_path = Column(String(500), nullable=True)
    processed_image_path = Column(String(500), nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("detection_sessions.id"), nullable=True)
    source = Column(String(20), default="upload")  # upload | webcam

    operator = relationship("User", back_populates="detections")
    session = relationship("DetectionSession", back_populates="detections")


class DetectionSession(Base):
    __tablename__ = "detection_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_name = Column(String(100), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="active")  # active | ended

    detections = relationship("Detection", back_populates="session")

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/scrap_metal_db"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    UPLOAD_FOLDER: str = "uploads"
    PROCESSED_FOLDER: str = "processed"
    MODEL_PATH: str = "best.pt"
    CONFIDENCE_THRESHOLD: float = 0.5
    MAX_UPLOAD_SIZE_MB: int = 20

    model_config = {"env_file": ".env"}


settings = Settings()

Path(settings.UPLOAD_FOLDER).mkdir(exist_ok=True)
Path(settings.PROCESSED_FOLDER).mkdir(exist_ok=True)

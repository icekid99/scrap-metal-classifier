import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database.database import create_tables
from app.ai.model_loader import load_model
from app.api import auth, detect, dashboard, detections, users

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — creating database tables...")
    create_tables()
    logger.info("Loading YOLOv8 model...")
    load_model(settings.MODEL_PATH)
    logger.info("Application ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Scrap Metal Classification API",
    description="AI-powered scrap metal detection and classification using YOLOv8",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(detect.router)
app.include_router(dashboard.router)
app.include_router(detections.router)
app.include_router(users.router)

Path(settings.UPLOAD_FOLDER).mkdir(exist_ok=True)
Path(settings.PROCESSED_FOLDER).mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_FOLDER), name="uploads")
app.mount("/processed", StaticFiles(directory=settings.PROCESSED_FOLDER), name="processed")


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

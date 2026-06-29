# ScrapVision — AI Scrap Metal Classification System

AI-powered scrap metal detection and classification using YOLOv8 for Ages Industrial Solutions.

## Features
- Upload images for instant AI classification
- Live webcam detection with real-time inference
- Bounding box visualization on detected objects
- Detection history with search, filter, and CSV export
- Dashboard analytics with pie/bar/line charts
- Admin user management (CRUD)
- JWT authentication with role-based access (Admin / Operator)
- Demo mode when `best.pt` is not present (simulated detections)

## Supported Metal Classes
Steel · Cast Iron · Aluminium · Copper · Brass · Lead

---

## Quick Start (Docker)

```bash
cd scrap-metal-classifier
# Optional: place your trained model
cp /path/to/best.pt backend/best.pt
# Start all services
docker compose up --build
```

App runs at **http://localhost**  
API docs at **http://localhost:8000/api/docs**

---

## Manual Setup

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET in .env

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # set VITE_API_URL if needed
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Environment Variables

### Backend (.env)
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | postgresql://postgres:password@localhost:5432/scrap_metal_db | PostgreSQL connection string |
| `JWT_SECRET` | change-me | JWT signing secret |
| `JWT_EXPIRE_MINUTES` | 1440 | Token expiry (minutes) |
| `MODEL_PATH` | best.pt | Path to YOLOv8 model |
| `CONFIDENCE_THRESHOLD` | 0.5 | Minimum detection confidence |
| `UPLOAD_FOLDER` | uploads | Original image storage |
| `PROCESSED_FOLDER` | processed | Annotated image storage |

### Frontend (.env)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | (empty = same origin) | Backend base URL |

---

## AI Model

Place your trained YOLOv8 model as `backend/best.pt`.

Train with Ultralytics:
```bash
yolo train data=scrap_metal.yaml model=yolov8n.pt epochs=100 imgsz=640
```

**Without `best.pt`:** the system runs in demo mode — random but realistic predictions are returned so the UI is fully functional for testing.

---

## Default Admin Account

Create via the register API on first run:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","role":"admin"}'
```

---

## API Reference

Full interactive docs: **http://localhost:8000/api/docs**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Current user |
| POST | `/api/detect/upload` | Upload image for detection |
| POST | `/api/detect/webcam` | Submit webcam frame |
| WS | `/api/detect/ws` | WebSocket live detection |
| GET | `/api/detections` | Detection history |
| GET | `/api/detections/export/csv` | Export CSV |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/monthly` | Monthly chart data |
| GET | `/api/dashboard/daily` | Daily chart data (30 days) |
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/{id}` | Update user (admin) |
| DELETE | `/api/users/{id}` | Delete user (admin) |

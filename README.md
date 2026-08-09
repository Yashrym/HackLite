# VisionRoute

AI-powered, crowd-sourced road infrastructure monitoring. Citizens upload road imagery; the backend runs **YOLOv8** inference; authorities triage reports on an **OpenStreetMap** dashboard with analytics and disaster mode.


##  Project Demo

Watch our project walkthrough and live demonstration on YouTube:

▶️ **[Watch the VisionRoute Demo on YouTube](https://youtu.be/eez4peqGAUI)**



## Stack

| Layer | Technologies |
|--------|----------------|
| Frontend | React, Vite, Tailwind CSS, React Router, React Leaflet, Axios, Recharts |
| Backend | FastAPI, Motor (MongoDB), Ultralytics YOLOv8 |
| Data | MongoDB |

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **MongoDB** running locally (or a remote URI)

## Project structure

```
HACKKKK/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routers/reports.py
│   │   └── services/   # YOLO + severity
│   ├── uploads/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        └── services/api.js
```

## Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows — use cp on Unix
```

Edit `.env` if needed:

- `MONGODB_URI` — default `mongodb://localhost:27017`
- `YOLO_MOCK=1` — skip heavy model download and use mock detections (useful for demos/CI)

Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

OpenAPI docs: http://127.0.0.1:8000/docs

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/reports` | Create report |
| GET | `/reports` | List reports (`severity`, `status`, `criticalOnly`) |
| GET | `/reports/{id}` | Report by id |
| PATCH | `/reports/{id}/status` | Update status (`pending`, `assigned`, `resolved`, `duplicate`) |
| GET | `/statistics` | Dashboard aggregates |
| POST | `/reports/detect` | Upload image → YOLO inference |

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

App: http://localhost:5173 (proxies `/api` and `/uploads` to the backend).

## Features (MVP)

1. **Landing** — product overview and CTAs  
2. **Camera upload** — image capture/upload, YOLO boxes, GPS/manual coords, submit  
3. **Citizen report** — optional description + auto YOLO before submit  
4. **Authority dashboard** — map markers (red/orange/green), filters, stat cards, charts  
5. **Disaster mode** — critical-only filter + mock emergency routes / affected zones  
6. **Report details** — full metadata + assign / resolve / duplicate actions  

## MongoDB document shape

Reports are stored with fields aligned to the product schema:

- `imageUrl`, `latitude`, `longitude`, `damageType`, `confidence`, `severity`, `timestamp`, `status`
- Plus `description`, `detections[]` for admin and detail views

## YOLO notes

The default model is `yolov8n.pt` (COCO). Standard COCO weights do not include road-specific classes; the service filters irrelevant classes and **falls back to mock pothole/crack boxes** when no suitable detections are found, so the MVP flow always works. For production, train or fine-tune YOLO on a road-damage dataset and set `YOLO_MODEL` to your weights path.

## License

MIT (adjust as needed for your hackathon or organization).

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import close_db, get_db
from app.routers import reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload dir exists
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    yield
    await close_db()


app = FastAPI(title="VisionRoute API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router)

upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")


@app.get("/health")
async def health():
    try:
        db = get_db()
        await db.command("ping")
        mongo_ok = True
    except Exception:
        mongo_ok = False
    return {"status": "ok", "mongodb": mongo_ok}


# Alias statistics at /statistics for spec compliance
@app.get("/statistics")
async def statistics_alias():
    return await reports.get_statistics()

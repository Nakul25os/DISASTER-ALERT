import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from nlp_engine import analyze_post
from severity import calculate_severity
from sachet_poller import sachet_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# ==========================================
# APP
# ==========================================

app = FastAPI(
    title="Smart Disaster Alert & Intelligence API",
    description="NLP service & SACHET NDMA official disaster alert integration",
    version="1.1.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# LIFECYCLE
# ==========================================

@app.on_event("startup")
async def startup_event():
    logger.info("Starting SACHET NDMA live disaster alert poller...")
    sachet_service.start()


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Stopping SACHET NDMA poller...")
    sachet_service.stop()


# ==========================================
# DATA
# ==========================================

DATA_PATH = (
    Path(__file__).parent
    / "data"
    / "social_posts.json"
)


# ==========================================
# REQUEST MODEL
# ==========================================

class PostRequest(BaseModel):
    text: str


# ==========================================
# ROOT & HEALTH
# ==========================================

@app.get("/")
def root():
    return {
        "project": "DisasterAlert",
        "module": "Social Media Intelligence & SACHET NDMA Integration",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DisasterAlert NLP & SACHET NDMA",
        "version": "1.1.0"
    }


# ==========================================
# NLP ANALYZE ONE POST
# ==========================================

@app.post("/api/analyze")
def analyze_new_post(post: PostRequest):
    result = analyze_post(post.text)
    result["severity"] = calculate_severity(result["emergency_score"])
    return result


# ==========================================
# ANALYZE ALL SAMPLE POSTS
# ==========================================

@app.get("/api/posts")
def get_posts():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as file:
            posts = json.load(file)
    except Exception:
        posts = []

    alerts = []
    for post in posts:
        result = analyze_post(post.get("text", ""))
        result["id"] = post.get("id", "sample")
        result["severity"] = calculate_severity(result["emergency_score"])
        alerts.append(result)

    return {
        "count": len(alerts),
        "alerts": alerts
    }


# ==========================================
# SACHET NDMA LIVE DISASTER ALERTS ENDPOINTS
# ==========================================

@app.get("/api/sachet/alerts")
def get_sachet_alerts(
    disaster_type: Optional[str] = Query(None, description="Filter by disaster type (e.g. FLOOD, CYCLONE)"),
    state: Optional[str] = Query(None, description="Filter by Indian State/UT (e.g. Assam, Maharashtra)"),
    limit: int = Query(50, ge=1, le=200, description="Max number of alerts to return")
):
    """
    Fetch recent official SACHET NDMA disaster alerts with optional filtering.
    """
    alerts = sachet_service.get_alerts(disaster_type=disaster_type, state=state, limit=limit)
    return {
        "count": len(alerts),
        "source": "SACHET_NDMA",
        "alerts": alerts
    }


@app.get("/api/sachet/poll")
@app.post("/api/sachet/poll")
def trigger_sachet_poll():
    """
    Manual trigger to immediately poll the SACHET NDMA feed and process new alerts.
    """
    result = sachet_service.poll_once()
    return result


@app.get("/api/sachet/status")
def get_sachet_status():
    """
    Get diagnostic telemetry and status of the SACHET background poller.
    """
    return sachet_service.get_status()
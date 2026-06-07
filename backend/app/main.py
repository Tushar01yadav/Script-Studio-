import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.api import api_router

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

# Create static audio folder
os.makedirs(os.path.join("static", "audio"), exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack YouTube Script Studio SaaS API",
    version="1.0.0"
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static audio files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include master API router
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to YouTube Script Studio API"}

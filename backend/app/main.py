import os
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.api import api_router

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

def run_db_migrations():
    from app.core.database import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT TRUE"))
        db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

run_db_migrations()

# Create static audio folder
os.makedirs(os.path.join("static", "audio"), exist_ok=True)

class CORSStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope) -> Response:
        response = await super().get_response(path, scope)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

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
        "https://script-studio-alpha.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://script-studio-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static audio files
app.mount("/static", CORSStaticFiles(directory="static"), name="static")

# Include master API router
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to YouTube Script Studio API"}

from fastapi import APIRouter
from app.api.endpoints import auth, transcript, script, tts, scenes, projects, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(transcript.router, prefix="/transcript", tags=["transcript"])
api_router.include_router(script.router, prefix="/script", tags=["script"])
api_router.include_router(tts.router, prefix="/tts", tags=["tts"])
api_router.include_router(scenes.router, prefix="/scenes", tags=["scenes"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.services.scenes import generate_scene_plan

router = APIRouter()

class SceneRequest(BaseModel):
    script: str

class SceneResponse(BaseModel):
    scene_plan: str

@router.post("/generate", response_model=SceneResponse)
async def generate_scenes(payload: SceneRequest, current_user: User = Depends(get_current_user)):
    if not payload.script.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Script cannot be empty."
        )
    try:
        scenes_json = await generate_scene_plan(payload.script)
        return SceneResponse(scene_plan=scenes_json)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

from pydantic import BaseModel
from typing import Optional
import datetime

class ProjectBase(BaseModel):
    title: str
    youtube_url: Optional[str] = None
    transcript: Optional[str] = None
    paraphrased_script: Optional[str] = None
    voiceover_text: Optional[str] = None
    scene_plan: Optional[str] = None
    audio_path: Optional[str] = None
    audio_files: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    youtube_url: Optional[str] = None
    transcript: Optional[str] = None
    paraphrased_script: Optional[str] = None
    voiceover_text: Optional[str] = None
    scene_plan: Optional[str] = None
    audio_path: Optional[str] = None
    audio_files: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

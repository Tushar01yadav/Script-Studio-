import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.services.edge_tts_service import generate_tts_voiceover
from tinytag import TinyTag

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice: str = "alloy"
    emotion: str = "default"
    model: str = "gpt-4o-mini-tts"

class TTSResponse(BaseModel):
    audio_url: str
    duration: float

@router.post("/generate", response_model=TTSResponse)
async def generate_voiceover(payload: TTSRequest, current_user: User = Depends(get_current_user)):
    if not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text input cannot be empty."
        )
    try:
        audio_url, duration = await generate_tts_voiceover(
            payload.text, 
            model=payload.model, 
            voice=payload.voice, 
            emotion=payload.emotion
        )
        return TTSResponse(audio_url=audio_url, duration=duration)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/upload", response_model=TTSResponse)
async def upload_audio(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        os.makedirs(os.path.join("static", "audio"), exist_ok=True)
        ext = os.path.splitext(file.filename)[1] if file.filename else ".wav"
        if not ext:
            ext = ".wav"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join("static", "audio", filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        duration = 0.0
        if os.path.exists(file_path):
            try:
                tag = TinyTag.get(file_path)
                duration = tag.duration or 0.0
            except Exception:
                pass
                
        return TTSResponse(audio_url=f"/static/audio/{filename}", duration=duration)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



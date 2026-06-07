import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class TranscriptRequest(BaseModel):
    url: str

class TranscriptResponse(BaseModel):
    video_id: str
    transcript: str

def extract_video_id(url: str) -> str:
    # Match standard watch URL, share URL, embed URL, shorts URL, and direct 11-char ID
    regex = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/|^)([^"&?\/\s]{11})'
    match = re.search(regex, url)
    if not match:
        raise ValueError("Invalid YouTube URL. Could not parse Video ID.")
    return match.group(1)

@router.post("/generate", response_model=TranscriptResponse)
def generate_transcript(payload: TranscriptRequest, current_user: User = Depends(get_current_user)):
    try:
        video_id = extract_video_id(payload.url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    try:
        yt_api = YouTubeTranscriptApi()
        transcript_list = yt_api.list(video_id)
        try:
            # Try to fetch English first
            transcript_obj = transcript_list.find_transcript(['en'])
        except Exception:
            # Fallback to any available language
            transcript_obj = next(iter(transcript_list))
            
        fetched_lines = transcript_obj.fetch()
        full_transcript = " ".join([entry.text for entry in fetched_lines])
        return TranscriptResponse(video_id=video_id, transcript=full_transcript)
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcripts are disabled for this video."
        )
    except NoTranscriptFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transcript was found for this video."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the transcript: {str(e)}"
        )

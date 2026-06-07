from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.services.mistral import paraphrase_transcript

router = APIRouter()

from typing import Optional

class ParaphraseRequest(BaseModel):
    transcript: str
    language: Optional[str] = "English"

class ParaphraseResponse(BaseModel):
    paraphrased_script: str

@router.post("/paraphrase", response_model=ParaphraseResponse)
async def paraphrase(payload: ParaphraseRequest, current_user: User = Depends(get_current_user)):
    if not payload.transcript.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript cannot be empty."
        )
    try:
        rewritten = await paraphrase_transcript(payload.transcript, payload.language)
        return ParaphraseResponse(paraphrased_script=rewritten)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

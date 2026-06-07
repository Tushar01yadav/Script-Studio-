import os
import uuid
import httpx
from app.core.config import settings

async def generate_tts_voiceover(text: str, model: str = "tts-1", voice: str = "alloy") -> str:
    # Ensure static directory exists
    os.makedirs(os.path.join("static", "audio"), exist_ok=True)
    
    filename = f"{uuid.uuid4()}.mp3"
    file_path = os.path.join("static", "audio", filename)

    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "placeholderopenai":
        # Create a mock silent/dummy audio or return a placeholder success path for development
        # We can just write a small placeholder file or write nothing if it is mockup
        with open(file_path, "wb") as f:
            f.write(b"MOCK AUDIO FILE CONTENT - PLEASE CONFIGURE OPENAI_API_KEY")
        return f"/static/audio/{filename}"

    url = "https://api.openai.com/v1/audio/speech"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # Map gpt-4o-mini-tts to tts-1 if standard model is required, but support user input
    api_model = "tts-1" if model == "gpt-4o-mini-tts" else model

    data = {
        "model": api_model,
        "input": text,
        "voice": voice
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data, headers=headers, timeout=60.0)
            if response.status_code != 200:
                raise Exception(f"OpenAI TTS API error: {response.text}")
            
            with open(file_path, "wb") as f:
                f.write(response.content)
            
            return f"/static/audio/{filename}"
        except Exception as e:
            raise Exception(f"Failed to generate TTS from OpenAI: {str(e)}")

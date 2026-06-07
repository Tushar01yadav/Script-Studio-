import httpx
from app.core.config import settings

async def paraphrase_transcript(transcript: str, language: str = "English") -> str:
    if not settings.MISTRAL_API_KEY or settings.MISTRAL_API_KEY == "placeholdermistral":
        # Return a mock output for development / local fallback
        return f"[MOCK REWRITE in {language} - Configure MISTRAL_API_KEY to see real API output]\n\nHey everyone! Today we're diving deep into the transcript: {transcript[:150]}... \n\nMake sure to hit that subscribe button, like this video, and let's get right into the story!"

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}"
    }
    
    prompt = (
        "You are an expert YouTube content creator and scriptwriter.\n"
        f"Rewrite the following transcript into a highly engaging, retention-optimized YouTube narration script in {language}.\n"
        "Improve: the hook, retention hook, visual placeholders, storytelling, clarity, flow, and emotional engagement.\n"
        "Do NOT change the core meaning or introduce false information.\n"
        "Keep the narration script clean, professional, and directly speak to the audience.\n\n"
        f"Transcript:\n{transcript}"
    )

    data = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data, headers=headers, timeout=60.0)
            if response.status_code != 200:
                raise Exception(f"Mistral API error: {response.text}")
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            raise Exception(f"Failed to communicate with Mistral AI: {str(e)}")

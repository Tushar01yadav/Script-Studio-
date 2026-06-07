import asyncio
from app.services.edge_tts_service import generate_tts_voiceover

async def test():
    text = "Hello world! This is a test script to check the audio duration returned by the backend service."
    url, duration = await generate_tts_voiceover(text, voice="swara", emotion="default")
    print("Generated Audio URL:", url)
    print("Duration (seconds):", duration)

if __name__ == "__main__":
    asyncio.run(test())

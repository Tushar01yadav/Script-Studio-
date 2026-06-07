import os
import uuid
import edge_tts
from tinytag import TinyTag

# Mapping OpenAI voices to Microsoft Edge Neural voices
VOICE_MAP = {
    "alloy": "en-US-AvaNeural",
    "echo": "en-US-AndrewNeural",
    "fable": "en-GB-SoniaNeural",
    "onyx": "en-US-BrianNeural",
    "nova": "en-US-EmmaNeural",
    "shimmer": "en-US-AriaNeural",
    "swara": "hi-IN-SwaraNeural",
    "madhur": "hi-IN-MadhurNeural",
    "jenny": "en-US-JennyNeural",
    "guy": "en-US-GuyNeural",
    "ryan": "en-GB-RyanNeural",
    "libby": "en-GB-LibbyNeural",
    "steffan": "en-US-SteffanNeural",
    "michelle": "en-US-MichelleNeural",
}

# Map emotions/styles to voice speed (rate) and pitch settings supported by Edge TTS
STYLE_MAP = {
    "default": {"rate": "+0%", "pitch": "+0Hz"},
    "cheerful": {"rate": "+10%", "pitch": "+3Hz"},
    "sad": {"rate": "-12%", "pitch": "-3Hz"},
    "excited": {"rate": "+22%", "pitch": "+4Hz"},
    "friendly": {"rate": "+5%", "pitch": "+2Hz"},
    "hopeful": {"rate": "+2%", "pitch": "+1Hz"},
    "shouting": {"rate": "+15%", "pitch": "+3Hz"},
    "whispering": {"rate": "-10%", "pitch": "-3Hz"},
    "fearful": {"rate": "+8%", "pitch": "-2Hz"},
    "angry": {"rate": "+12%", "pitch": "-1Hz"},
    "chat": {"rate": "+0%", "pitch": "+0Hz"},
    "newscast": {"rate": "+5%", "pitch": "-1Hz"},
    "customerservice": {"rate": "+3%", "pitch": "+1Hz"},
    "assistant": {"rate": "+0%", "pitch": "+1Hz"},
}

async def generate_tts_voiceover(text: str, model: str = None, voice: str = "alloy", emotion: str = "default") -> tuple[str, float]:
    # Ensure static directory exists
    os.makedirs(os.path.join("static", "audio"), exist_ok=True)
    
    filename = f"{uuid.uuid4()}.mp3"
    file_path = os.path.join("static", "audio", filename)

    # Resolve voice mapping (case-insensitive fallback)
    edge_voice = VOICE_MAP.get(voice.lower(), voice)

    # Get rate and pitch settings for the requested emotion
    style_settings = STYLE_MAP.get(emotion.lower(), STYLE_MAP["default"])
    rate = style_settings["rate"]
    pitch = style_settings["pitch"]

    try:
        # Pass rate and pitch directly to Communicate
        communicate = edge_tts.Communicate(text, edge_voice, rate=rate, pitch=pitch)
        await communicate.save(file_path)
        
        # Calculate duration using TinyTag
        duration = 0.0
        if os.path.exists(file_path):
            try:
                tag = TinyTag.get(file_path)
                duration = tag.duration or 0.0
            except Exception:
                pass
                
        return f"/static/audio/{filename}", duration
    except Exception as e:
        raise Exception(f"Failed to generate TTS from Edge-TTS: {str(e)}")


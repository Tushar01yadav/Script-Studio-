import os
from dotenv import load_dotenv

# Load env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "YouTube Script Studio"
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    SMTP_EMAIL: str = os.getenv("SMTP_EMAIL", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./script_studio.db")
    AUDIO_STORAGE_PATH: str = os.getenv("AUDIO_STORAGE_PATH", "static/audio")

settings = Settings()

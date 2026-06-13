from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mistral_api_key: str
    mistral_model: str = "mistral-large-latest"
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    memory_threshold: float = 0.70
    top_k_memories: int = 5
    max_history_messages: int = 30
    redis_url: str = "redis://redis:6379/0"
    qdrant_url: str = "http://qdrant:6333"
    focus_area: str = "YouTube transcript rephrasing and style preferences"

    class Config:
        env_file = ".env"

settings = Settings()

from sentence_transformers import SentenceTransformer
from main import settings

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.embedding_model)

    async def get_embedding(self, text: str):
        # SentenceTransformer.encode is synchronous, but fast enough for this scale.
        return self.model.encode(text).tolist()

embedding_service = EmbeddingService()

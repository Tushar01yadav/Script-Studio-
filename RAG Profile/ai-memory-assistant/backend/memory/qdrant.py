from qdrant_client import AsyncQdrantClient
from main import settings

qdrant_client = AsyncQdrantClient(url=settings.qdrant_url)

async def search_memories(user_id: str, query_embedding: list, limit: int = 5):
    results = await qdrant_client.query_points(
        collection_name="memories",
        query=query_embedding,
        limit=limit,
        query_filter={"must": [{"key": "user_id", "match": {"value": user_id}}]}
    )
    return [r.payload for r in results.points]

async def store_memory(memory_data: dict):
    # Ensure collection exists (for production, use migration or check)
    await qdrant_client.upsert(
        collection_name="memories",
        points=[{
            "id": memory_data["id"],
            "vector": memory_data["embedding"],
            "payload": {k: v for k, v in memory_data.items() if k != "embedding"}
        }]
    )

async def get_all_memories(user_id: str):
    from qdrant_client import models
    response = await qdrant_client.scroll(
        collection_name="memories",
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="user_id",
                    match=models.MatchValue(value=user_id)
                )
            ]
        ),
        limit=100,
        with_payload=True,
        with_vectors=False
    )
    records, _ = response
    return [r.payload for r in records]

async def delete_all_memories(user_id: str):
    from qdrant_client import models
    await qdrant_client.delete(
        collection_name="memories",
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="user_id",
                        match=models.MatchValue(value=user_id)
                    )
                ]
            )
        )
    )


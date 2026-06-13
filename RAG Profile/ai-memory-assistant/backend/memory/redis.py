import redis.asyncio as redis
from main import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)

async def get_history(user_id: str, conversation_id: str):
    key = f"history:{user_id}:{conversation_id}"
    messages = await redis_client.lrange(key, 0, -1)
    return messages[-settings.max_history_messages:]

async def add_history(user_id: str, conversation_id: str, role: str, content: str):
    key = f"history:{user_id}:{conversation_id}"
    await redis_client.rpush(key, f"{role}: {content}")
    await redis_client.ltrim(key, -settings.max_history_messages, -1)

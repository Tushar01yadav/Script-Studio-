import httpx
from config.config import settings
from memory.qdrant import search_memories
from memory.redis import get_history
from embeddings.service import embedding_service

async def chat_with_memory(user_id: str, conversation_id: str, message: str, focus_area: str = None, mode: str = "chat"):
    if not focus_area:
        focus_area = settings.focus_area

    # 1. Embed message
    embedding = await embedding_service.get_embedding(message)
    
    # 2. Retrieve memories
    memories = await search_memories(user_id, embedding, limit=settings.top_k_memories)
    
    # 3. Get history
    history = await get_history(user_id, conversation_id)
    
    # 4. Construct prompt based on mode
    if mode == "interview":
        prompt = f"""
You are a personalized assistant interviewing the user to build their style profile in the field of: {focus_area}.
Your goal is to gather the user's choices, tone, and preferences (such as length, structure, vocabulary, casual vs formal).
Based on the existing user memories, identify what is still unknown or needs refinement and ask exactly ONE targeted question to learn their preferences.
If you have enough information, summarize their profile and ask if they would like to adjust anything.
Do not answer general questions; keep the user focused on setting up their profile.

Existing User Memories:
{memories}

Recent Conversation:
{history}

Current User Message:
{message}
        """
    else:
        prompt = f"""
You are a personalized assistant helping the user in the field of: {focus_area}.
Using the following user memories and chat history, respond to the current message.
Make sure your response aligns with the user's choices, style, and preferences regarding {focus_area}.

Relevant User Memories:
{memories}

Recent Conversation:
{history}

Current User Message:
{message}
        """
    
    # 5. Call Mistral
    # 5. Call Mistral with automatic 429 retry
    import asyncio
    try:
        async with httpx.AsyncClient() as client:
            retries = 4
            backoff = 1.0
            response = None
            
            for attempt in range(retries):
                response = await client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.mistral_api_key}"},
                    json={"model": settings.mistral_model, "messages": [{"role": "user", "content": prompt}]},
                    timeout=30.0
                )
                
                if response.status_code == 429:
                    print(f"Mistral API rate limited (429). Retrying in {backoff}s... (Attempt {attempt + 1}/{retries})")
                    await asyncio.sleep(backoff)
                    backoff *= 2.0
                    continue
                break
            
            if response is None:
                return "Error: No response from Mistral API."
                
            if response.status_code != 200:
                print(f"Mistral API Error: Status {response.status_code}, Response: {response.text}")
                return f"Mistral API Error (Status {response.status_code}): {response.text}"
                
            res_json = response.json()
            if "choices" not in res_json or not res_json["choices"]:
                print(f"Mistral API Unexpected Response: {res_json}")
                return "Error: Unexpected response format from Mistral API."
                
            return res_json["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Exception during Mistral API call: {e}")
        return f"Error communicating with Mistral API: {str(e)}"

import httpx
import json
import uuid
import re
from main import settings
from memory.qdrant import store_memory
from embeddings.service import embedding_service

# Guardrail patterns
FORBIDDEN_PATTERNS = [r"password", r"api_key", r"secret", r"credit_card"]

def is_safe(content: str) -> bool:
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            return False
    return True

async def extract_and_store_memory(user_id: str, conversation_id: str, message: str, assistant_response: str, focus_area: str = None):
    if not is_safe(message) or not is_safe(assistant_response):
        return # Guardrail rejection
        
    if not focus_area:
        focus_area = settings.focus_area
    
    # 1. Ask Mistral to extract
    prompt = f"Extract useful memory from this interaction: '{message}' -> '{assistant_response}'. Return ONLY a JSON object with: should_save (bool), memory_type (str), content (str), importance_score (float). Do not include any other text."
    
    try:
        async with httpx.AsyncClient() as client:
            retries = 4
            backoff = 2.0
            response = None
            for attempt in range(retries):
                response = await client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.mistral_api_key}"},
                    json={"model": settings.mistral_model, "messages": [{"role": "user", "content": prompt}]},
                    timeout=30.0
                )
                if response.status_code == 429:
                    print(f"Memory Extractor rate limited (429). Retrying in {backoff}s... (Attempt {attempt + 1}/{retries})")
                    import asyncio
                    await asyncio.sleep(backoff)
                    backoff *= 2.0
                    continue
                break
            
            if response is None:
                print("Memory Extractor: No response from Mistral API.")
                return
                
            if response.status_code != 200:
                print(f"Memory Extractor Mistral API Error: {response.status_code} - {response.text}")
                return
                
            res_json = response.json()
            if "choices" not in res_json or not res_json["choices"]:
                print(f"Memory Extractor Unexpected response: {res_json}")
                return
                
            content = res_json["choices"][0]["message"]["content"].strip()
            
            # Clean markdown code blocks if Mistral wraps it in ```json ... ```
            if "```" in content:
                start = content.find('{')
                end = content.rfind('}')
                if start != -1 and end != -1:
                    content = content[start:end+1]
            
            data = json.loads(content)
        
        # 2. Validate and Save
        if data.get("should_save") and data.get("importance_score", 0) >= settings.memory_threshold:
            embedding = await embedding_service.get_embedding(data["content"])
            memory_entry = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "conversation_id": conversation_id,
                "memory_type": data.get("memory_type", "general"),
                "content": data.get("content", ""),
                "importance_score": data.get("importance_score", 0.0),
                "embedding": embedding
            }
            await store_memory(memory_entry)
            print(f"Successfully stored memory: {data.get('content')}")
    except Exception as e:
        print(f"Failed to extract and store memory: {e}")


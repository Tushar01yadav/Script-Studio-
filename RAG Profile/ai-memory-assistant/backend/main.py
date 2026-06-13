from typing import Optional
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config.config import settings
from services.chat import chat_with_memory
from services.memory_extractor import extract_and_store_memory
from memory.redis import add_history

app = FastAPI(title="AI Memory Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the actual frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    conversation_id: str
    message: str
    focus_area: Optional[str] = None
    mode: Optional[str] = "chat"

@app.post("/chat")
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    try:
        response = await chat_with_memory(
            request.user_id,
            request.conversation_id,
            request.message,
            focus_area=request.focus_area,
            mode=request.mode
        )
    except Exception as e:
        return {"response": f"⚠️ Backend service error: {str(e)}. Please ensure Redis and Qdrant are running."}
    
    # Add to history
    try:
        await add_history(request.user_id, request.conversation_id, "user", request.message)
        await add_history(request.user_id, request.conversation_id, "assistant", response)
    except Exception:
        pass  # History storage is non-critical
    
    # Trigger memory extraction
    background_tasks.add_task(
        extract_and_store_memory,
        request.user_id,
        request.conversation_id,
        request.message,
        response,
        focus_area=request.focus_area
    )
    
    return {"response": response}

@app.get("/memories")
async def get_memories(user_id: str):
    from memory.qdrant import get_all_memories
    try:
        memories = await get_all_memories(user_id)
        return {"user_id": user_id, "memories": memories}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/memories")
async def delete_memories(user_id: str):
    from memory.qdrant import delete_all_memories
    try:
        await delete_all_memories(user_id)
        return {"status": "success", "message": f"All memories deleted for user {user_id}"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "ok"}


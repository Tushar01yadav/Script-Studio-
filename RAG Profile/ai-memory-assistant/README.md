# AI Memory Assistant

A production-ready, multi-user AI Memory Assistant with stateless LLM, long-term memory (Qdrant), and short-term memory (Redis).

## Architecture
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.12
- **Long-Term Memory**: Qdrant (Vector DB)
- **Short-Term Memory**: Redis (Conversation History)
- **Intelligence**: Mistral API
- **Embeddings**: BAAI/bge-small-en-v1.5

## Setup Guide
1. Copy `.env.example` to `.env` and fill in `MISTRAL_API_KEY`.
2. Run the system:
   ```bash
   docker compose up --build
   ```

## API Documentation
- `POST /chat`: Chat with the assistant.
- `GET /health`: Health check.

## Upgrade Path (Embedding Model)
1. Update `EMBEDDING_MODEL` in `.env` to `BAAI/bge-m3`.
2. Update embedding dimension in `backend/services/embedding.py` (if required).
3. Re-index existing memories if dimension changes.

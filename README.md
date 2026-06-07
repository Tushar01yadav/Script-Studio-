# YouTube Script Studio

YouTube Script Studio is a full-stack SaaS platform designed for YouTube creators to manage their workflow from extracting transcripts to rewriting scripts with AI, generating premium text-to-speech voiceovers, and planning scene-by-scene visual storyboards with optimized image prompts.

## Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS v4, React Router, Axios, TanStack React Query, Heroicons, React Hot Toast
- **Backend**: FastAPI, SQLite (SQLAlchemy), JWT Auths, `youtube-transcript-api`
- **Integrations**: Mistral AI API (`mistral-large-latest`), OpenAI API (`tts-1` / `gpt-4o-mini-tts`)

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- SMTP Credentials (Gmail App Password)
- Mistral AI and OpenAI API Keys

---

### Backend Setup (Local)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `backend/.env` (copy from `.env.example`).
5. Run the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
6. The documentation is available at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup (Local)

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Run Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173`.

---

### Running with Docker Compose

To launch the entire full-stack application instantly inside isolated containers:
```bash
docker-compose up --build
```
This serves:
- **FastAPI Backend**: `http://localhost:8000`
- **React Frontend**: `http://localhost:5173`
- Database tables and directories are mapped automatically to persist your SQLite data and static audio file creations locally.

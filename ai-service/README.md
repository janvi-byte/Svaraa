# Speakora AI Service

FastAPI service that will eventually handle speech analysis for Speakora.
This is a foundation only — no speech-to-text or LLM libraries are included yet.

## Prerequisites

- Python 3.11 or newer

## Setup

From the `ai-service/` directory:

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env
```

| Variable           | Default                                 | Description                          |
|--------------------|-----------------------------------------|--------------------------------------|
| `AI_SERVICE_HOST`  | `0.0.0.0`                               | Host address the service binds to    |
| `AI_SERVICE_PORT`  | `8001`                                  | Port the service listens on          |
| `CORS_ORIGINS`     | `http://localhost:5173`                 | Comma-separated allowed CORS origins |

## Running

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Or directly:

```bash
python main.py
```

The API documentation is available at `http://localhost:8001/docs` once running.

## Endpoints

| Method | Path     | Description                                             |
|--------|----------|---------------------------------------------------------|
| GET    | `/health`| Returns service health status                          |
| POST   | `/analyze`| Placeholder — returns 501 Not Implemented              |

This service is independent from MongoDB. All database operations remain handled by the Node/Express backend.

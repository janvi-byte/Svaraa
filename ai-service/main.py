import os
from contextlib import asynccontextmanager
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

HOST = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
PORT = int(os.getenv("AI_SERVICE_PORT", "8001"))


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: Literal["speakora-ai"]


class AnalyzeRequest(BaseModel):
    session_id: str = Field(..., description="Identifier of the speaking session to analyze")
    audio_format: str = Field(..., description="Format of the submitted audio, e.g. 'webm' or 'wav'")
    duration_seconds: float = Field(..., ge=0, description="Length of the recording in seconds")
    language: str = Field(default="en", description="BCP-47 language tag for the spoken content")


class AnalyzeResponse(BaseModel):
    session_id: str
    status: Literal["not_implemented"]
    message: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Speakora AI Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="speakora-ai")


@app.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "session_id": request.session_id,
            "status": "not_implemented",
            "message": "AI analysis is not yet available. This endpoint is a placeholder.",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

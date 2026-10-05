import os
import tempfile
from contextlib import asynccontextmanager
from typing import Literal
from analyzer import analyze_text

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
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

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", 26_214_400))

_whisper_model = None


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper  # type: ignore
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Speech-to-text model is not available. Ensure openai-whisper is installed.",
            ) from exc
        _whisper_model = whisper.load_model(WHISPER_MODEL_NAME)
    return _whisper_model


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: Literal["speakora-ai"]


class AnalyzeRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=10000)
    duration_seconds: float = Field(default=0, ge=0)


class AnalyzeResponse(BaseModel):
    overall: int
    fluency: int
    vocabulary: int
    grammar: int
    pacing: int
    filler_count: int
    words_per_minute: int
    vocabulary_diversity: int
    repeated_phrase_count: int
    feedback: list[str]
    strengths: list[str]


class TranscribeResponse(BaseModel):
    transcript: str
    language: str
    duration_seconds: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Speakora AI Service",
    version="0.2.0",
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


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    result = analyze_text(
        request.transcript,
        request.duration_seconds
    )

    return AnalyzeResponse(**result)


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    audio: UploadFile = File(...),
    duration_seconds: float = 0.0,
) -> TranscribeResponse:
    if not audio.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No audio file provided.")

    content = await audio.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded audio file is empty.")

    if len(content) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file exceeds the maximum size of {MAX_AUDIO_BYTES} bytes.",
        )

    suffix = os.path.splitext(audio.filename)[1] or ".webm"

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        model = _get_whisper_model()
        result = model.transcribe(tmp_path)

        detected_language = result.get("language", "en")
        transcript_text = (result.get("text") or "").strip()

        if not transcript_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No speech was detected in the audio recording. Please try recording again.",
            )

        return TranscribeResponse(
            transcript=transcript_text,
            language=detected_language,
            duration_seconds=duration_seconds,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {exc}",
        ) from exc
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

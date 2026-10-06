from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import tempfile
import subprocess
import wave
import audioop

from analyzer import analyze_text

load_dotenv()

app = FastAPI(
    title="Speakora AI Service",
    version="1.0.0",
)

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
whisper_model = None


class AnalyzeRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=10000)
    duration_seconds: float = Field(default=0, ge=0)
    preferred_language: str = Field(default="English", max_length=50)


class GrammarError(BaseModel):
    original: str
    correction: str
    explanation: str
    category: str


class VocabularyUpgrade(BaseModel):
    used_word: str
    suggested_word: str
    meaning: str
    preferred_language: str
    translation: str
    reason: str
    examples: list[str]


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
    grammar_errors: list[GrammarError]
    vocabulary_upgrades: list[VocabularyUpgrade]
    preferred_language: str
    improved_answer: str
    feedback: list[str]
    strengths: list[str]


def get_whisper_model():
    global whisper_model

    if whisper_model is None:
        import whisper

        print(
            f"Loading Whisper model: {WHISPER_MODEL_NAME}"
        )

        whisper_model = whisper.load_model(
            WHISPER_MODEL_NAME
        )

        print("Whisper model loaded.")

    return whisper_model


def calculate_audio_level(wav_path):
    with wave.open(wav_path, "rb") as audio:
        sample_width = audio.getsampwidth()
        frames = audio.readframes(audio.getnframes())

    if not frames:
        return -100

    rms = audioop.rms(
        frames,
        sample_width,
    )

    if rms <= 0:
        return -100

    max_amplitude = float(
        1 << (8 * sample_width - 1)
    )

    return 20 * __import__("math").log10(
        rms / max_amplitude
    )


def has_confident_speech(result):
    segments = result.get("segments", [])

    if not segments:
        return False

    speech_segments = []

    for segment in segments:
        text = segment.get("text", "").strip()
        no_speech_probability = segment.get(
            "no_speech_prob",
            1.0,
        )

        if (
            text
            and no_speech_probability < 0.55
        ):
            speech_segments.append(segment)

    return len(speech_segments) > 0


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "speakora-ai",
        "whisper_model": WHISPER_MODEL_NAME,
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    try:
        result = analyze_text(
            transcript=request.transcript,
            duration_seconds=request.duration_seconds,
            preferred_language=request.preferred_language,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    duration_seconds: float = Form(0),
):
    temp_input = None
    temp_output = None

    try:
        audio_data = await audio.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="The uploaded audio file is empty.",
            )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".webm",
        ) as input_file:
            input_file.write(audio_data)
            temp_input = input_file.name

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav",
        ) as output_file:
            temp_output = output_file.name

        conversion = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                temp_input,
                "-vn",
                "-ac",
                "1",
                "-ar",
                "16000",
                "-c:a",
                "pcm_s16le",
                temp_output,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        if conversion.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail="Unable to process the recorded audio.",
            )

        if not os.path.exists(temp_output):
            raise HTTPException(
                status_code=500,
                detail="Audio conversion failed.",
            )

        audio_level = calculate_audio_level(
            temp_output
        )

        print(
            f"Recorded audio level: {audio_level:.1f} dBFS"
        )

        if audio_level < -45:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No clear speech detected. "
                    "Please record your answer again."
                ),
            )

        model = get_whisper_model()

        result = model.transcribe(
            temp_output,
            fp16=False,
            language="en",
            condition_on_previous_text=False,
            temperature=0,
            no_speech_threshold=0.6,
            logprob_threshold=-1.0,
            compression_ratio_threshold=2.4,
        )

        if not has_confident_speech(result):
            raise HTTPException(
                status_code=400,
                detail=(
                    "No clear speech detected. "
                    "Please record your answer again."
                ),
            )

        transcript = result.get(
            "text",
            "",
        ).strip()

        if not transcript:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No clear speech detected. "
                    "Please record your answer again."
                ),
            )

        return {
            "transcript": transcript,
            "language": result.get(
                "language",
                "en",
            ),
            "duration_seconds": duration_seconds,
        }

    except HTTPException:
        raise

    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="FFmpeg was not found.",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {error}",
        )

    finally:
        for path in [temp_input, temp_output]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
    )
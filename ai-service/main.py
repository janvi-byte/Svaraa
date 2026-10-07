from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import tempfile
import subprocess
import wave
import audioop
import time

from google import genai
from google.genai import types

from analyzer import analyze_text

load_dotenv()

app = FastAPI(
    title="Speakora AI Service",
    version="1.0.0",
)

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
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


class GeminiGrammarError(BaseModel):
    original: str
    correction: str
    explanation: str


class GeminiVocabularyUpgrade(BaseModel):
    original: str
    suggestion: str
    explanation: str


class GeminiCoachingResponse(BaseModel):
    improved_answer: str
    grammar_errors: list[GeminiGrammarError]
    vocabulary_upgrades: list[GeminiVocabularyUpgrade]


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
    contextual_coaching_available: bool = True
    contextual_coaching_error: str | None = None


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


def generate_contextual_coaching(
    transcript,
    preferred_language,
):
    if not GEMINI_API_KEY:
        return None, "Gemini is not configured."

    prompt = f"""
You are a careful English speaking coach. Review the learner's complete
transcript and return contextual coaching as structured data.

Preserve the learner's meaning, ideas, opinions, and approximate length.
Correct meaningful grammar and usage problems, improve unnatural phrasing
only when useful, and make the answer sound natural and fluent in
conversational English. Do not invent facts, examples, opinions, or
experiences. Do not make an already-natural sentence more sophisticated.
Treat possible speech-to-text mistakes as uncertain unless the surrounding
context makes the intended meaning reasonably clear; never present an
uncertain ASR interpretation as a confirmed learner mistake.

Return only:
- improved_answer: a complete meaning-preserving rewrite
- grammar_errors: meaningful grammar or usage issues actually present
- vocabulary_upgrades: contextual suggestions only when they genuinely
  improve the sentence; do not replace words merely with harder synonyms

Preferred language: {preferred_language}
Learner transcript:
{transcript}
""".strip()

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = None
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=GeminiCoachingResponse,
                    ),
                )
                break
            except Exception as error:
                if (
                    attempt == 0
                    and (
                        getattr(error, "code", None) == 503
                        or getattr(error, "status", None) == "UNAVAILABLE"
                    )
                ):
                    time.sleep(2)
                    continue
                raise

        coaching = response.parsed
        if not isinstance(coaching, GeminiCoachingResponse):
            return None, "Gemini returned an invalid coaching response."

        return coaching, None
    except Exception as error:
        print(
            f"Gemini contextual coaching unavailable: {type(error).__name__}"
        )
        return None, "Gemini contextual coaching is unavailable."


def apply_contextual_coaching(result, transcript, preferred_language):
    coaching, error = generate_contextual_coaching(
        transcript,
        preferred_language,
    )

    if coaching is None:
        result["contextual_coaching_available"] = False
        result["contextual_coaching_error"] = error
        return result

    result["improved_answer"] = coaching.improved_answer.strip()
    result["grammar_errors"] = [
        {
            "original": item.original,
            "correction": item.correction,
            "explanation": item.explanation,
            "category": "Contextual usage",
        }
        for item in coaching.grammar_errors
    ]
    result["vocabulary_upgrades"] = [
        {
            "used_word": item.original,
            "suggested_word": item.suggestion,
            "meaning": item.explanation,
            "preferred_language": preferred_language,
            "translation": item.suggestion,
            "reason": item.explanation,
            "examples": [],
        }
        for item in coaching.vocabulary_upgrades
    ]
    result["contextual_coaching_available"] = True
    result["contextual_coaching_error"] = None
    return result


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

        return apply_contextual_coaching(
            result,
            request.transcript,
            request.preferred_language,
        )

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

        segments = [
            {
                "start": float(segment["start"]),
                "end": float(segment["end"]),
                "text": segment.get("text", "").strip(),
            }
            for segment in result.get("segments", [])
            if isinstance(segment, dict)
            and isinstance(segment.get("start"), (int, float))
            and isinstance(segment.get("end"), (int, float))
            and segment.get("text", "").strip()
        ]

        response = {
            "transcript": transcript,
            "language": result.get(
                "language",
                "en",
            ),
            "duration_seconds": duration_seconds,
        }

        if segments:
            response["segments"] = segments

        return response

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


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        from analyzer import (
            detect_fillers,
            detect_grammar_errors,
            detect_vocabulary_upgrades,
            normalize_text,
            split_sentences,
        )

        messages = request.messages

        if not messages:
            raise HTTPException(
                status_code=400,
                detail="No messages provided.",
            )

        system_content = ""
        conversation_text = []

        for msg in messages:
            if msg.role == "system":
                system_content = msg.content
            elif msg.role == "user":
                conversation_text.append(msg.content)

        user_text = " ".join(conversation_text[-3:]) if conversation_text else ""

        filler_count = detect_fillers(user_text) if user_text else 0
        grammar_errors = detect_grammar_errors(user_text) if user_text else []
        vocab_upgrades = detect_vocabulary_upgrades(user_text, "English") if user_text else []
        sentences = split_sentences(user_text) if user_text else []

        reply_parts = []

        last_user_msg = conversation_text[-1] if conversation_text else ""

        if last_user_msg:
            if filler_count > 2:
                reply_parts.append(
                    "I noticed a few filler words in your response."
                )

            if grammar_errors:
                first_error = grammar_errors[0]
                reply_parts.append(
                    f"Quick note: instead of \"{first_error['original']}\", "
                    f"try \"{first_error['correction']}\"."
                )

            if vocab_upgrades:
                first_upgrade = vocab_upgrades[0]
                reply_parts.append(
                    f"Consider using \"{first_upgrade['suggested_word']}\" "
                    f"instead of \"{first_upgrade['used_word']}\"."
                )

            if len(sentences) <= 1 and len(last_user_msg.split()) < 15:
                reply_parts.append(
                    "Could you tell me a bit more about that?"
                )

            if not reply_parts:
                word_count = len(last_user_msg.split())
                if word_count < 10:
                    reply_parts.append(
                        "That's a start. Can you expand on that idea?"
                    )
                else:
                    reply_parts.append(
                        "That's a good point. What made you think of it that way?"
                    )
        else:
            reply_parts.append(
                "Hello! I'm here to help you practice speaking. "
                "What would you like to talk about today?"
            )

        reply = " ".join(reply_parts)

        return {"reply": reply}

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {error}",
        )


@app.post("/pronunciation-check")
def pronunciation_check(request: AnalyzeRequest):
    try:
        from analyzer import normalize_text, words

        transcript = normalize_text(request.transcript)
        token_list = words(transcript)

        if not token_list:
            raise HTTPException(
                status_code=400,
                detail="No words detected for pronunciation practice.",
            )

        difficult_words = []
        long_words = [w for w in set(token_list) if len(w) >= 7]

        for word in long_words[:10]:
            syllable_count = max(
                1,
                sum(
                    1
                    for ch in word.lower()
                    if ch in "aeiou"
                ),
            )

            difficult_words.append(
                {
                    "word": word,
                    "syllables": syllable_count,
                    "guidance": f"Break '{word}' into {syllable_count} syllables and say each one clearly.",
                    "example": f"Practice saying: {word}. {word}. {word}.",
                }
            )

        return {
            "difficult_words": difficult_words,
            "total_words": len(token_list),
            "unique_words": len(set(token_list)),
            "note": (
                "This is word-level pronunciation guidance based on your transcript. "
                "For phoneme-level accuracy, a dedicated speech alignment model would be needed."
            ),
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Pronunciation check failed: {error}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
    )
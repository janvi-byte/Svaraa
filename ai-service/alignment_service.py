import os
import re
import subprocess
import tempfile
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

import whisperx


app = FastAPI(title="Speakora Reference Alignment Service", version="1.0.0")
MODEL_NAME = os.getenv("WHISPERX_MODEL", "tiny")
DEVICE = "cpu"
COMPUTE_TYPE = "int8"
whisper_model = None
align_model = None
align_metadata = None


def get_models():
    global whisper_model, align_model, align_metadata

    if whisper_model is None:
        whisper_model = whisperx.load_model(
            MODEL_NAME,
            DEVICE,
            compute_type=COMPUTE_TYPE,
        )

    if align_model is None or align_metadata is None:
        align_model, align_metadata = whisperx.load_align_model(
            language_code="en",
            device=DEVICE,
        )

    return whisper_model, align_model, align_metadata


def normalize_words(text: str) -> list[str]:
    return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())


def compare_words(reference_text: str, transcript: str) -> dict[str, Any]:
    reference_words = normalize_words(reference_text)
    recognized_words = normalize_words(transcript)

    missing_words = [
        word
        for index, word in enumerate(reference_words)
        if index >= len(recognized_words) or recognized_words[index] != word
    ]
    extra_words = [
        word
        for index, word in enumerate(recognized_words)
        if index >= len(reference_words) or reference_words[index] != word
    ]

    return {
        "referenceWordCount": len(reference_words),
        "recognizedWordCount": len(recognized_words),
        "missingWords": missing_words,
        "extraWords": extra_words,
        "recognizedTextMatchesReference": (
            reference_words == recognized_words
        ),
    }


def convert_to_wav(input_path: str, output_path: str) -> None:
    conversion = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            output_path,
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


def aligned_words(result: dict[str, Any]) -> list[dict[str, Any]]:
    words = []
    for segment in result.get("segments", []):
        for item in segment.get("words", []):
            word = item.get("word", "").strip()
            start = item.get("start")
            end = item.get("end")
            if (
                word
                and isinstance(start, (int, float))
                and isinstance(end, (int, float))
            ):
                words.append(
                    {
                        "word": word,
                        "start": float(start),
                        "end": float(end),
                    }
                )
    return words


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "speakora-reference-alignment",
        "model": MODEL_NAME,
        "device": DEVICE,
    }


@app.post("/align")
async def align(
    audio: UploadFile = File(...),
    reference_text: str = Form(...),
    duration_seconds: float = Form(0),
):
    del duration_seconds
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

        convert_to_wav(temp_input, temp_output)
        model, alignment_model, metadata = get_models()
        transcription = model.transcribe(
            temp_output,
            fp16=False,
            language="en",
            condition_on_previous_text=False,
            temperature=0,
        )
        transcript = transcription.get("text", "").strip()
        if not transcript:
            raise HTTPException(
                status_code=400,
                detail="No clear speech detected. Please record your answer again.",
            )

        aligned = whisperx.align(
            transcription.get("segments", []),
            alignment_model,
            metadata,
            temp_output,
            DEVICE,
            return_char_alignments=False,
        )

        return {
            "transcript": transcript,
            "words": aligned_words(aligned),
            "comparison": compare_words(reference_text, transcript),
        }
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="FFmpeg was not found.")
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Reference alignment failed: {error}",
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

    uvicorn.run(app, host="0.0.0.0", port=8002)

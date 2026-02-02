import os
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.schemas import StoryGenerateRequest, StoryResponse
from app.services.gemini_service import generate_story, GeminiError
from app.services.tts_service import generate_audio, TTSError
from app.config import AUDIO_STORAGE_PATH, WORDS_PER_MINUTE

router = APIRouter(prefix="/story", tags=["story"])

# Ensure storage directory exists
Path(AUDIO_STORAGE_PATH).mkdir(parents=True, exist_ok=True)


@router.post("/generate", response_model=StoryResponse)
async def generate_story_endpoint(request: StoryGenerateRequest):
    """Generate a complete story with audio."""

    try:
        # Step 1: Generate story text with Gemini
        story_data = await generate_story(
            keywords=request.keywords,
            lang=request.lang.value,
            duration_minutes=request.duration_minutes,
            child_names=request.child_names
        )

        title = story_data["title"]
        text = story_data["text"]

        # Step 2: Generate audio with Edge TTS
        audio_data = await generate_audio(
            text=text,
            voice_id=request.voice_id,
            speed=0.9  # Slightly slower for children
        )

        # Step 3: Save audio file
        story_id = str(uuid.uuid4())
        audio_filename = f"{story_id}.mp3"
        audio_path = Path(AUDIO_STORAGE_PATH) / audio_filename

        with open(audio_path, "wb") as f:
            f.write(audio_data)

        # Estimate duration based on word count
        word_count = len(text.split())
        duration_seconds = int((word_count / WORDS_PER_MINUTE) * 60)

        return StoryResponse(
            story_id=story_id,
            title=title,
            text=text,
            audio_url=f"/api/story/audio/{audio_filename}",
            duration_seconds=duration_seconds
        )

    except GeminiError as e:
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")
    except TTSError as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")


@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """Stream the audio file for a story."""

    # Validate filename format
    if not filename.endswith(".mp3"):
        raise HTTPException(status_code=400, detail="Invalid audio format")

    audio_path = Path(AUDIO_STORAGE_PATH) / filename

    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=filename,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600"
        }
    )

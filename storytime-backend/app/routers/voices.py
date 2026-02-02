from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response
from app.models.schemas import VoicesResponse, VoicePreviewRequest, Language
from app.services.voices_service import get_voices, get_voice_by_id
from app.services.tts_service import generate_preview, TTSError

router = APIRouter(prefix="/voices", tags=["voices"])


@router.get("", response_model=VoicesResponse)
async def list_voices(lang: Language = Query(default=Language.FR)):
    """Get available voices for the specified language."""
    voices = get_voices(lang.value)
    return VoicesResponse(voices=voices)


@router.post("/preview")
async def preview_voice(request: VoicePreviewRequest):
    """Generate a preview audio for a voice."""
    voice = get_voice_by_id(request.voice_id)

    if not voice:
        raise HTTPException(status_code=404, detail=f"Voice {request.voice_id} not found")

    # Use custom text or default preview text
    text = request.text if request.text else voice.preview_text

    try:
        audio_data = await generate_preview(text, request.voice_id)
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=preview_{request.voice_id}.mp3"
            }
        )
    except TTSError as e:
        raise HTTPException(status_code=500, detail=str(e))

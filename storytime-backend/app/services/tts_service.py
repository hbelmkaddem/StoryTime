import httpx
import logging
from app.config import EDGE_TTS_URL

logger = logging.getLogger(__name__)


class TTSError(Exception):
    """Custom exception for TTS errors."""
    pass


async def generate_audio(text: str, voice_id: str, speed: float = 0.9) -> bytes:
    """Generate audio from text using Edge TTS."""

    logger.info(f"Generating audio: voice={voice_id}, text_length={len(text)}")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{EDGE_TTS_URL}/v1/audio/speech",
                headers={
                    "Authorization": "Bearer sk-storytime",
                    "Content-Type": "application/json"
                },
                json={
                    "input": text,
                    "voice": voice_id,
                    "speed": speed,
                    "response_format": "mp3"
                },
                timeout=180.0  # Long timeout for long stories
            )

            if response.status_code != 200:
                logger.error(f"TTS error: {response.status_code} - {response.text[:500]}")
                raise TTSError(f"Edge TTS error: {response.status_code} - {response.text}")

            logger.info(f"Audio generated successfully, size={len(response.content)} bytes")
            return response.content

        except httpx.TimeoutException:
            logger.error("TTS timeout")
            raise TTSError("TTS timeout - audio generation took too long")
        except httpx.RequestError as e:
            logger.error(f"Network error: {str(e)}")
            raise TTSError(f"Network error calling Edge TTS: {str(e)}")


async def generate_preview(text: str, voice_id: str) -> bytes:
    """Generate a short preview audio."""
    # Limit preview to first 100 characters
    preview_text = text[:100] if len(text) > 100 else text
    return await generate_audio(preview_text, voice_id, speed=1.0)

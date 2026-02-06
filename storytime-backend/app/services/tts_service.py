import httpx
import asyncio
import logging
import io
import re
from pydub import AudioSegment
from app.config import EDGE_TTS_URL

logger = logging.getLogger(__name__)


class TTSError(Exception):
    """Custom exception for TTS errors."""
    pass


async def generate_audio_chunk(text: str, voice_id: str, speed: float = 0.9) -> bytes:
    """Generate audio for a single chunk of text."""

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
                timeout=120.0
            )

            if response.status_code != 200:
                logger.error(f"TTS chunk error: {response.status_code}")
                raise TTSError(f"Edge TTS error: {response.status_code}")

            return response.content

        except httpx.TimeoutException:
            logger.error("TTS chunk timeout")
            raise TTSError("TTS timeout")
        except httpx.RequestError as e:
            logger.error(f"Network error: {str(e)}")
            raise TTSError(f"Network error: {str(e)}")


def split_text_into_chunks(text: str, max_chunks: int = 4) -> list:
    """Split text into chunks at paragraph or sentence boundaries."""

    # First, try splitting by paragraphs
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

    if len(paragraphs) >= max_chunks:
        # Merge paragraphs into roughly equal chunks
        chunk_size = len(paragraphs) // max_chunks
        chunks = []
        for i in range(max_chunks):
            start = i * chunk_size
            end = start + chunk_size if i < max_chunks - 1 else len(paragraphs)
            chunk_text = '\n\n'.join(paragraphs[start:end])
            if chunk_text:
                chunks.append(chunk_text)
        return chunks
    elif len(paragraphs) > 1:
        return paragraphs
    else:
        # Split by sentences if no paragraphs
        sentences = re.split(r'(?<=[.!?])\s+', text)
        if len(sentences) >= max_chunks:
            chunk_size = len(sentences) // max_chunks
            chunks = []
            for i in range(max_chunks):
                start = i * chunk_size
                end = start + chunk_size if i < max_chunks - 1 else len(sentences)
                chunk_text = ' '.join(sentences[start:end])
                if chunk_text:
                    chunks.append(chunk_text)
            return chunks
        else:
            return [text]  # Return as single chunk if too short


def merge_audio_chunks(audio_chunks: list) -> bytes:
    """Merge multiple MP3 audio chunks into a single file."""

    combined = AudioSegment.empty()

    for chunk_data in audio_chunks:
        if chunk_data:
            audio_segment = AudioSegment.from_mp3(io.BytesIO(chunk_data))
            combined += audio_segment

    # Export to bytes
    output = io.BytesIO()
    combined.export(output, format="mp3", bitrate="128k")
    return output.getvalue()


async def generate_audio(text: str, voice_id: str, speed: float = 0.9) -> bytes:
    """Generate audio from text using parallel TTS processing."""

    logger.info(f"Generating audio: voice={voice_id}, text_length={len(text)}")

    # Split text into chunks
    chunks = split_text_into_chunks(text, max_chunks=4)
    logger.info(f"Split text into {len(chunks)} chunks")

    if len(chunks) == 1:
        # Single chunk, no need for parallel processing
        audio_data = await generate_audio_chunk(chunks[0], voice_id, speed)
        logger.info(f"Audio generated (single chunk), size={len(audio_data)} bytes")
        return audio_data

    # Generate audio for all chunks in parallel
    logger.info(f"Starting parallel TTS for {len(chunks)} chunks...")
    start_time = asyncio.get_event_loop().time()

    tasks = [generate_audio_chunk(chunk, voice_id, speed) for chunk in chunks]
    audio_chunks = await asyncio.gather(*tasks, return_exceptions=True)

    # Check for errors
    for i, result in enumerate(audio_chunks):
        if isinstance(result, Exception):
            logger.error(f"Chunk {i} failed: {result}")
            raise TTSError(f"Failed to generate audio chunk {i}: {result}")

    parallel_time = asyncio.get_event_loop().time() - start_time
    logger.info(f"Parallel TTS completed in {parallel_time:.1f}s")

    # Merge audio chunks
    logger.info("Merging audio chunks...")
    merged_audio = merge_audio_chunks(audio_chunks)

    logger.info(f"Audio generated successfully, size={len(merged_audio)} bytes")
    return merged_audio


async def generate_preview(text: str, voice_id: str) -> bytes:
    """Generate a short preview audio."""
    # Limit preview to first 100 characters
    preview_text = text[:100] if len(text) > 100 else text
    return await generate_audio_chunk(preview_text, voice_id, speed=1.0)

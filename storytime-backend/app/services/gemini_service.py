import httpx
import re
import logging
from app.config import GEMINI_API_KEY
from app.services.prompt_service import build_story_prompt

logger = logging.getLogger(__name__)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


class GeminiError(Exception):
    """Custom exception for Gemini API errors."""
    pass


def parse_story_response(text: str) -> dict:
    """Parse the story response to extract title and content."""
    # Try to find TITRE: or TITLE: pattern
    title_match = re.search(r'^(?:TITRE|TITLE):\s*(.+?)$', text, re.MULTILINE | re.IGNORECASE)

    if title_match:
        title = title_match.group(1).strip()
        # Get content after the --- separator
        parts = text.split("---", 1)
        if len(parts) > 1:
            content = parts[1].strip()
        else:
            # If no separator, get everything after the title line
            content = text[title_match.end():].strip()
    else:
        # Fallback: use first line as title
        lines = text.strip().split('\n')
        title = lines[0].strip()
        content = '\n'.join(lines[1:]).strip()

    return {
        "title": title,
        "text": content
    }


async def generate_story(
    keywords: str,
    lang: str,
    duration_minutes: int,
    child_names: list[str] | None = None,
    gender: str = "boy",
    age: int = 6
) -> dict:
    """Generate a story using Gemini API."""

    if not GEMINI_API_KEY:
        raise GeminiError("GEMINI_API_KEY not configured")

    logger.info(f"Generating story: lang={lang}, keywords={keywords}, gender={gender}, age={age}")
    prompt = build_story_prompt(keywords, lang, duration_minutes, child_names, gender, age)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.8,
                        "maxOutputTokens": 8192
                    }
                },
                timeout=120.0  # Increased for longer stories
            )

            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.status_code} - {response.text[:500]}")
                raise GeminiError(f"Gemini API error: {response.status_code} - {response.text}")

            data = response.json()

            # Extract text from response
            if "candidates" not in data or not data["candidates"]:
                logger.error(f"No candidates in response: {data}")
                raise GeminiError("No candidates in Gemini response")

            candidate = data["candidates"][0]

            # Check for blocked content
            if "finishReason" in candidate and candidate["finishReason"] == "SAFETY":
                logger.error(f"Content blocked by safety filter: {candidate}")
                raise GeminiError("Story content was blocked by safety filters")

            if "content" not in candidate or "parts" not in candidate["content"]:
                logger.error(f"Invalid response structure: {candidate}")
                raise GeminiError("Invalid response structure from Gemini")

            text = candidate["content"]["parts"][0]["text"]
            logger.info(f"Story generated successfully, length={len(text)}")
            return parse_story_response(text)

        except httpx.TimeoutException:
            logger.error("Gemini API timeout")
            raise GeminiError("Gemini API timeout - story generation took too long")
        except httpx.RequestError as e:
            logger.error(f"Network error: {str(e)}")
            raise GeminiError(f"Network error calling Gemini: {str(e)}")

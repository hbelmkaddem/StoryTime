import os
from pathlib import Path
from app.config import WORDS_PER_MINUTE

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(lang: str) -> str:
    """Load prompt template for the given language."""
    prompt_file = PROMPTS_DIR / f"story_{lang}.txt"
    if not prompt_file.exists():
        prompt_file = PROMPTS_DIR / "story_fr.txt"

    with open(prompt_file, "r", encoding="utf-8") as f:
        return f.read()


def calculate_word_count(duration_minutes: int) -> int:
    """Calculate target word count based on duration."""
    return duration_minutes * WORDS_PER_MINUTE


def build_story_prompt(
    keywords: str,
    lang: str,
    duration_minutes: int,
    child_names: list[str] | None = None,
    gender: str = "boy",
    age: int = 6
) -> str:
    """Build the full prompt for story generation."""
    template = load_prompt(lang)
    word_count = calculate_word_count(duration_minutes)

    names_str = ", ".join(child_names) if child_names else "aucun"
    if lang == "en" and not child_names:
        names_str = "none"

    # Translate gender
    if lang == "fr":
        gender_str = "garçon" if gender == "boy" else "fille"
    else:
        gender_str = gender

    prompt = template.format(
        duration=duration_minutes,
        word_count=word_count,
        keywords=keywords,
        child_names=names_str,
        gender=gender_str,
        age=age
    )

    return prompt

from app.models.schemas import Voice

# French voices
VOICES_FR = [
    Voice(
        id="fr-FR-DeniseNeural",
        name="La Fee",
        gender="female",
        description="Voix douce et chaleureuse",
        preview_text="Il etait une fois, dans un royaume enchante..."
    ),
    Voice(
        id="fr-FR-HenriNeural",
        name="Le Sage",
        gender="male",
        description="Voix grave et rassurante",
        preview_text="Il etait une fois, dans un royaume enchante..."
    ),
    Voice(
        id="fr-FR-EloiseNeural",
        name="La Petite",
        gender="female",
        description="Voix jeune et enjouee",
        preview_text="Il etait une fois, dans un royaume enchante..."
    ),
    Voice(
        id="fr-FR-RemyMultilingualNeural",
        name="Le Conteur",
        gender="male",
        description="Voix de narrateur professionnel",
        preview_text="Il etait une fois, dans un royaume enchante..."
    ),
    Voice(
        id="fr-FR-VivienneMultilingualNeural",
        name="Grand-Mere",
        gender="female",
        description="Voix chaleureuse et bienveillante",
        preview_text="Il etait une fois, dans un royaume enchante..."
    ),
]

# English voices
VOICES_EN = [
    Voice(
        id="en-US-JennyNeural",
        name="The Fairy",
        gender="female",
        description="Warm and gentle voice",
        preview_text="Once upon a time, in an enchanted kingdom..."
    ),
    Voice(
        id="en-US-GuyNeural",
        name="The Wizard",
        gender="male",
        description="Deep narrator voice",
        preview_text="Once upon a time, in an enchanted kingdom..."
    ),
    Voice(
        id="en-US-AnaNeural",
        name="The Little One",
        gender="female",
        description="Young and cheerful voice",
        preview_text="Once upon a time, in an enchanted kingdom..."
    ),
    Voice(
        id="en-GB-SoniaNeural",
        name="The Queen",
        gender="female",
        description="Elegant British voice",
        preview_text="Once upon a time, in an enchanted kingdom..."
    ),
    Voice(
        id="en-US-BrandonNeural",
        name="The Knight",
        gender="male",
        description="Strong and brave voice",
        preview_text="Once upon a time, in an enchanted kingdom..."
    ),
]


def get_voices(lang: str) -> list[Voice]:
    """Get available voices for a language."""
    if lang == "en":
        return VOICES_EN
    return VOICES_FR


def get_voice_by_id(voice_id: str) -> Voice | None:
    """Get a specific voice by ID."""
    all_voices = VOICES_FR + VOICES_EN
    for voice in all_voices:
        if voice.id == voice_id:
            return voice
    return None


def get_default_voice(lang: str) -> str:
    """Get the default voice ID for a language."""
    if lang == "en":
        return "en-US-JennyNeural"
    return "fr-FR-DeniseNeural"

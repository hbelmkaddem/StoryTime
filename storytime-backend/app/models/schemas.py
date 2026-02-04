from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Language(str, Enum):
    FR = "fr"
    EN = "en"


class Voice(BaseModel):
    id: str
    name: str
    gender: str
    description: str
    preview_text: str


class VoicesResponse(BaseModel):
    voices: list[Voice]


class VoicePreviewRequest(BaseModel):
    voice_id: str
    text: Optional[str] = None
    lang: Language = Language.FR


class Gender(str, Enum):
    BOY = "boy"
    GIRL = "girl"


class StoryGenerateRequest(BaseModel):
    keywords: str
    lang: Language = Language.FR
    voice_id: str = "fr-FR-DeniseNeural"
    duration_minutes: int = Field(default=5, ge=1, le=15)
    child_names: Optional[list[str]] = None
    gender: Optional[Gender] = Gender.BOY
    age: Optional[int] = Field(default=6, ge=3, le=14)


class StoryResponse(BaseModel):
    story_id: str
    title: str
    text: str
    audio_url: str
    duration_seconds: int


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
API_SECRET_KEY = os.getenv("API_SECRET_KEY", "storytime-secret-key")

# Edge TTS
EDGE_TTS_URL = os.getenv("EDGE_TTS_URL", "http://edge-tts:5050")

# Story settings
DEFAULT_STORY_DURATION = int(os.getenv("DEFAULT_STORY_DURATION", "5"))
MAX_STORY_DURATION = int(os.getenv("MAX_STORY_DURATION", "15"))

# Words per minute for TTS (average reading speed)
WORDS_PER_MINUTE = 150

# Temp storage for audio files
AUDIO_STORAGE_PATH = "/tmp/stories"
AUDIO_CLEANUP_HOURS = 1

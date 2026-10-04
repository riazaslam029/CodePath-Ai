import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# AI settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gemini-1.5-flash")

# GitHub Token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

# App paths
BASE_DIR = Path(__file__).resolve().parent.parent
DEMO_REPO_DIR = BASE_DIR / "app" / "demo_repo"

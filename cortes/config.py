"""Configurações lidas do arquivo .env (veja .env.example)."""
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _env(name: str, default: str) -> str:
    return os.getenv(name, default).strip()


@dataclass
class Config:
    # Pastas
    work_dir: Path = field(default_factory=lambda: Path(_env("CORTES_WORK_DIR", "work")))
    secrets_dir: Path = field(default_factory=lambda: Path(_env("CORTES_SECRETS_DIR", "secrets")))

    # Transcrição (Whisper)
    whisper_model: str = field(default_factory=lambda: _env("WHISPER_MODEL", "small"))
    whisper_device: str = field(default_factory=lambda: _env("WHISPER_DEVICE", "auto"))
    language: str = field(default_factory=lambda: _env("LANGUAGE", "pt"))

    # Seleção dos cortes (Claude)
    claude_model: str = field(default_factory=lambda: _env("CLAUDE_MODEL", "claude-opus-5-5"))
    max_clips: int = field(default_factory=lambda: int(_env("MAX_CLIPS", "6")))
    min_clip_seconds: float = field(default_factory=lambda: float(_env("MIN_CLIP_SECONDS", "20")))
    max_clip_seconds: float = field(default_factory=lambda: float(_env("MAX_CLIP_SECONDS", "59")))
    channel_context: str = field(default_factory=lambda: _env("CHANNEL_CONTEXT", ""))

    # Vídeo / legenda
    reframe_mode: str = field(default_factory=lambda: _env("REFRAME_MODE", "face"))  # face | center | blur
    font_name: str = field(default_factory=lambda: _env("SUBTITLE_FONT", "DejaVu Sans"))
    highlight_color: str = field(default_factory=lambda: _env("SUBTITLE_HIGHLIGHT", "00FFFF"))  # cor em BGR (formato ASS); 00FFFF = amarelo
    words_per_caption: int = field(default_factory=lambda: int(_env("WORDS_PER_CAPTION", "3")))

    # YouTube
    privacy: str = field(default_factory=lambda: _env("YOUTUBE_PRIVACY", "private"))  # private | unlisted | public
    category_id: str = field(default_factory=lambda: _env("YOUTUBE_CATEGORY_ID", "22"))  # 22 = People & Blogs
    extra_tags: list[str] = field(
        default_factory=lambda: [t.strip() for t in _env("YOUTUBE_EXTRA_TAGS", "").split(",") if t.strip()]
    )
    hours_between_posts: float = field(default_factory=lambda: float(_env("HOURS_BETWEEN_POSTS", "0")))

    @property
    def client_secret_file(self) -> Path:
        return self.secrets_dir / "client_secret.json"

    @property
    def token_file(self) -> Path:
        return self.secrets_dir / "youtube_token.json"

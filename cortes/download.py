"""Etapa 1: baixar a live (VOD) do YouTube com yt-dlp."""
from pathlib import Path

import yt_dlp


def video_info(url: str) -> dict:
    with yt_dlp.YoutubeDL({"quiet": True, "skip_download": True}) as ydl:
        return ydl.extract_info(url, download=False)


def download(url: str, out_dir: Path) -> Path:
    """Baixa o vídeo em até 1080p como source.mp4. Pula se já existir."""
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / "source.mp4"
    if target.exists():
        print(f"[download] já existe: {target}")
        return target

    opts = {
        "format": "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/bv*[height<=1080]+ba/b[height<=1080]/b",
        "merge_output_format": "mp4",
        "outtmpl": str(out_dir / "source.%(ext)s"),
        "noplaylist": True,
        # Lives em andamento: baixa desde o começo (só funciona se o canal permitir DVR)
        "live_from_start": True,
        "quiet": False,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])

    if not target.exists():
        # yt-dlp pode ter salvo com outra extensão
        candidates = sorted(out_dir.glob("source.*"))
        if not candidates:
            raise RuntimeError("Download terminou mas nenhum arquivo source.* foi encontrado")
        candidates[0].rename(target)
    return target


def list_finished_lives(channel_url: str, limit: int = 5) -> list[dict]:
    """Lista as lives já encerradas mais recentes de um canal (aba /streams)."""
    url = channel_url.rstrip("/")
    if not url.endswith("/streams"):
        url += "/streams"
    with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": True, "playlistend": limit}) as ydl:
        info = ydl.extract_info(url, download=False)
    lives = []
    for entry in info.get("entries") or []:
        # Na listagem "flat", live_status vem como was_live / is_live / is_upcoming
        if entry.get("live_status") in ("was_live", "post_live", None):
            lives.append({"id": entry["id"], "title": entry.get("title", ""),
                          "url": f"https://www.youtube.com/watch?v={entry['id']}",
                          "live_status": entry.get("live_status")})
    return lives

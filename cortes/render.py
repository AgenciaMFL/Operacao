"""Etapa 4c: cortar, reenquadrar para 9:16 e queimar a legenda com ffmpeg."""
import subprocess
from pathlib import Path

from .config import Config
from .reframe import build_filter
from .subtitles import build_ass


def render_clip(source: Path, clip: dict, words: list[dict], out_dir: Path, index: int, cfg: Config) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    name = f"{index:02d}"
    out_mp4 = out_dir / f"{name}.mp4"
    if out_mp4.exists():
        print(f"[render] já existe: {out_mp4}")
        return out_mp4

    start, end = clip["start"], clip["end"]
    print(f"[render] {name}: {start:.1f}s → {end:.1f}s  \"{clip['title']}\"")

    build_ass(words, start, end, out_dir / f"{name}.ass", font=cfg.font_name,
              highlight_bgr=cfg.highlight_color, words_per_caption=cfg.words_per_caption)
    video_filter = build_filter(source, start, end, cfg.reframe_mode)
    graph = f"[0:v]{video_filter}[v0];[v0]ass={name}.ass[v]"

    cmd = [
        "ffmpeg", "-y", "-loglevel", "error", "-stats",
        "-ss", f"{start:.3f}", "-to", f"{end:.3f}", "-i", str(source.resolve()),
        "-filter_complex", graph, "-map", "[v]", "-map", "0:a?",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
        "-movflags", "+faststart", f"{name}.mp4",
    ]
    # Roda dentro da pasta do corte para o filtro "ass" não precisar de escape de caminho
    subprocess.run(cmd, check=True, cwd=out_dir)
    return out_mp4

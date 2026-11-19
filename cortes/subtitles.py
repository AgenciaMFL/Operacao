"""Etapa 4b: legenda estilo Shorts/Reels (poucas palavras, palavra atual destacada)."""
from pathlib import Path


def _ts(sec: float) -> str:
    sec = max(sec, 0)
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _clean(word: str) -> str:
    return word.replace("{", "").replace("}", "").replace("\\", "").upper()


def _chunks(words: list[dict], size: int) -> list[list[dict]]:
    """Agrupa palavras em blocos de até `size`, quebrando em pausas e fim de frase."""
    chunks, cur = [], []
    for w in words:
        if cur and (len(cur) >= size or w["start"] - cur[-1]["end"] > 0.6):
            chunks.append(cur)
            cur = []
        cur.append(w)
        if w["word"].endswith((".", "!", "?")):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def build_ass(words: list[dict], clip_start: float, clip_end: float, out: Path,
              font: str = "DejaVu Sans", highlight_bgr: str = "00FFFF", words_per_caption: int = 3) -> Path:
    """Gera arquivo .ass com tempos relativos ao início do corte."""
    clip_words = [
        {**w, "start": w["start"] - clip_start, "end": min(w["end"], clip_end) - clip_start}
        for w in words if w["start"] >= clip_start - 0.05 and w["end"] <= clip_end + 0.3
    ]

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font},86,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,7,3,2,80,80,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for chunk in _chunks(clip_words, words_per_caption):
        for i, w in enumerate(chunk):
            start = w["start"]
            # Mantém o bloco na tela até a próxima palavra começar (sem "piscar")
            end = chunk[i + 1]["start"] if i + 1 < len(chunk) else w["end"] + 0.15
            if end <= start:
                end = start + 0.05
            parts = []
            for j, other in enumerate(chunk):
                text = _clean(other["word"])
                if j == i:
                    text = f"{{\\c&H{highlight_bgr}&\\fscx110\\fscy110}}{text}{{\\r}}"
                parts.append(text)
            lines.append(f"Dialogue: 0,{_ts(start)},{_ts(end)},Default,,0,0,0,,{' '.join(parts)}")

    out.write_text(header + "\n".join(lines) + "\n", encoding="utf-8")
    return out

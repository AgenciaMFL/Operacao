"""Etapa 2: transcrever o áudio com faster-whisper (timestamps por palavra)."""
import json
import subprocess
from pathlib import Path


def extract_audio(video: Path, out: Path) -> Path:
    if out.exists():
        return out
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(video),
         "-vn", "-ac", "1", "-ar", "16000", str(out)],
        check=True,
    )
    return out


def transcribe(video: Path, out_json: Path, model_size: str = "small",
               device: str = "auto", language: str = "pt") -> dict:
    """Gera {"segments": [{"start","end","text","words":[{"start","end","word"}]}]}."""
    if out_json.exists():
        print(f"[transcrição] já existe: {out_json}")
        return json.loads(out_json.read_text(encoding="utf-8"))

    from faster_whisper import WhisperModel  # import tardio: carregar o modelo é pesado

    audio = extract_audio(video, out_json.with_name("audio.wav"))
    compute_type = "float16" if device == "cuda" else "int8"
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    segments_iter, info = model.transcribe(
        str(audio),
        language=language or None,
        word_timestamps=True,
        vad_filter=True,  # ignora silêncio / música sem fala
    )
    print(f"[transcrição] idioma={info.language} duração={info.duration:.0f}s")

    segments = []
    for seg in segments_iter:
        words = [{"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word.strip()}
                 for w in (seg.words or []) if w.word.strip()]
        segments.append({"start": round(seg.start, 2), "end": round(seg.end, 2),
                         "text": seg.text.strip(), "words": words})
        print(f"  [{seg.start:7.1f}s] {seg.text.strip()[:80]}")

    data = {"language": info.language, "duration": info.duration, "segments": segments}
    out_json.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    return data


def all_words(transcript: dict) -> list[dict]:
    return [w for seg in transcript["segments"] for w in seg["words"]]

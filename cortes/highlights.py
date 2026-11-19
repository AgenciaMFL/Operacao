"""Etapa 3: o Claude lê a transcrição e escolhe os melhores trechos para Shorts."""
import json
from pathlib import Path

import anthropic
from pydantic import BaseModel, Field

from .config import Config
from .transcribe import all_words


class Clip(BaseModel):
    start: float = Field(description="Início do corte em segundos (use os tempos da transcrição)")
    end: float = Field(description="Fim do corte em segundos")
    title: str = Field(description="Título curto e chamativo para o Short, até 70 caracteres, sem hashtags")
    description: str = Field(description="Descrição do Short, 1 a 3 frases")
    hashtags: list[str] = Field(description="3 a 6 hashtags sem o símbolo #")
    hook: str = Field(description="A frase de gancho que abre o corte")
    score: int = Field(description="Potencial de viralizar de 1 a 10")
    reason: str = Field(description="Por que este trecho funciona como Short")


class ClipList(BaseModel):
    clips: list[Clip]


SYSTEM = """Você é um editor de vídeo especialista em YouTube Shorts para o público brasileiro.
Você recebe a transcrição com tempos de uma live e escolhe os trechos com mais potencial de viralizar.

Um bom corte:
- Começa com um gancho forte nos primeiros 2 segundos (uma afirmação polêmica, uma pergunta, um número, uma história).
- Faz sentido sozinho, sem depender do resto da live.
- Termina numa conclusão, punchline ou frase de impacto — nunca no meio de uma ideia.
- Tem uma única ideia central.

Regras:
- Use exatamente os tempos que aparecem na transcrição; comece no início de uma fala e termine no fim de outra.
- Os cortes não podem se sobrepor.
- Ignore trechos de abertura/encerramento da live, leitura de chat, pedidos de like, silêncio e problemas técnicos.
- Escreva títulos e descrições em português do Brasil, sem clickbait enganoso.
- Ordene os cortes do maior para o menor score."""


def format_transcript(transcript: dict) -> str:
    return "\n".join(f"[{s['start']:.1f}-{s['end']:.1f}] {s['text']}" for s in transcript["segments"])


def _snap_to_words(clip: dict, words: list[dict]) -> dict:
    """Ajusta início/fim para bordas de palavras, evitando cortar sílabas."""
    if not words:
        return clip
    starts = [w for w in words if w["start"] >= clip["start"] - 0.5]
    ends = [w for w in words if clip["start"] < w["end"] <= clip["end"] + 0.5]
    if starts:
        clip["start"] = max(0.0, starts[0]["start"] - 0.15)
    if ends:
        clip["end"] = ends[-1]["end"] + 0.35
    return clip


def pick_clips(transcript: dict, out_json: Path, cfg: Config, video_title: str = "") -> list[dict]:
    if out_json.exists():
        print(f"[cortes] já existe: {out_json}")
        return json.loads(out_json.read_text(encoding="utf-8"))

    prompt = (
        f"Título da live: {video_title or '(sem título)'}\n"
        + (f"Contexto do canal: {cfg.channel_context}\n" if cfg.channel_context else "")
        + f"\nEscolha até {cfg.max_clips} cortes, cada um com duração entre "
        f"{cfg.min_clip_seconds:.0f} e {cfg.max_clip_seconds:.0f} segundos.\n\n"
        f"<transcricao>\n{format_transcript(transcript)}\n</transcricao>"
    )

    client = anthropic.Anthropic()
    response = client.beta.messages.parse(
        model=cfg.claude_model,
        max_tokens=16000,
        system=SYSTEM,
        messages=[{"role": "user", "content": prompt}],
        output_format=ClipList,
        output_config={"effort": "high"},
        # Se o modelo recusar o pedido, a API refaz em outro modelo automaticamente
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if response.stop_reason == "refusal":
        raise RuntimeError(f"O modelo recusou a análise: {response.stop_details}")
    if response.stop_reason == "max_tokens" or response.parsed_output is None:
        raise RuntimeError(f"Resposta incompleta do Claude (stop_reason={response.stop_reason})")

    words = all_words(transcript)
    clips = []
    for c in response.parsed_output.clips:
        clip = _snap_to_words(c.model_dump(), words)
        dur = clip["end"] - clip["start"]
        if dur < cfg.min_clip_seconds * 0.8 or dur > 180:  # Shorts aceita até 3 min
            print(f"[cortes] descartado (duração {dur:.0f}s): {clip['title']}")
            continue
        clip["approved"] = True  # mude para false no clips.json para não postar
        clips.append(clip)

    clips = clips[: cfg.max_clips]
    out_json.write_text(json.dumps(clips, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[cortes] {len(clips)} cortes escolhidos (request id {response._request_id})")
    return clips

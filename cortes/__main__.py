"""Linha de comando.

    python -m cortes auth                      # autoriza o canal do YouTube (uma vez)
    python -m cortes run URL_DA_LIVE           # baixa, transcreve, escolhe e renderiza os cortes
    python -m cortes run URL_DA_LIVE --upload  # ...e já posta no YouTube Shorts
    python -m cortes upload work/<id>          # posta os cortes aprovados de uma live já processada
    python -m cortes watch URL_DO_CANAL        # verifica lives novas do canal e processa/posta tudo
"""
import argparse
import json
import sys
from pathlib import Path

from .config import Config


def process(url: str, cfg: Config, upload: bool) -> Path:
    from .download import download, video_info
    from .highlights import pick_clips
    from .render import render_clip
    from .transcribe import all_words, transcribe

    info = video_info(url)
    if info.get("live_status") == "is_live":
        print("Aviso: a live ainda está no ar. O ideal é rodar depois que ela terminar.")
    job = cfg.work_dir / info["id"]
    job.mkdir(parents=True, exist_ok=True)
    (job / "info.json").write_text(json.dumps(
        {"id": info["id"], "title": info.get("title"), "url": url, "duration": info.get("duration")},
        ensure_ascii=False, indent=2))
    print(f"== {info.get('title')} ({info['id']}) ==")

    source = download(url, job)
    transcript = transcribe(source, job / "transcript.json", cfg.whisper_model, cfg.whisper_device, cfg.language)
    clips = pick_clips(transcript, job / "clips.json", cfg, video_title=info.get("title", ""))

    words = all_words(transcript)
    for i, clip in enumerate(clips, start=1):
        render_clip(source, clip, words, job / "clips", i, cfg)

    print(f"\nCortes prontos em {job / 'clips'}")
    print(f"Para não postar algum, marque \"approved\": false em {job / 'clips.json'}")
    if upload:
        upload_job(job, cfg)
    return job


def upload_job(job: Path, cfg: Config) -> None:
    from .youtube_upload import upload_all
    clips = json.loads((job / "clips.json").read_text(encoding="utf-8"))
    upload_all(job / "clips", clips, cfg)


def watch(channel_url: str, cfg: Config, upload: bool) -> None:
    from .download import list_finished_lives
    seen_file = cfg.work_dir / "seen.json"
    seen = set(json.loads(seen_file.read_text())) if seen_file.exists() else set()
    first_run = not seen_file.exists()

    lives = list_finished_lives(channel_url)
    if first_run:
        # Na primeira execução só registra as lives antigas, para não postar o histórico todo
        seen.update(l["id"] for l in lives[1:])
    for live in lives:
        if live["id"] in seen:
            continue
        print(f"Nova live encontrada: {live['title']}")
        try:
            process(live["url"], cfg, upload)
            seen.add(live["id"])
        except Exception as e:  # segue para a próxima; tenta de novo na próxima execução
            print(f"Erro ao processar {live['id']}: {e}", file=sys.stderr)
    cfg.work_dir.mkdir(parents=True, exist_ok=True)
    seen_file.write_text(json.dumps(sorted(seen)))


def main() -> None:
    parser = argparse.ArgumentParser(prog="cortes", description="Cortes automáticos de lives para YouTube Shorts")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("auth", help="autoriza o canal do YouTube")

    p_run = sub.add_parser("run", help="processa uma live")
    p_run.add_argument("url")
    p_run.add_argument("--upload", action="store_true", help="posta no YouTube ao final")
    p_run.add_argument("--max-clips", type=int)
    p_run.add_argument("--reframe", choices=["face", "center", "blur"])

    p_up = sub.add_parser("upload", help="posta os cortes de uma pasta já processada")
    p_up.add_argument("job_dir", type=Path)

    p_watch = sub.add_parser("watch", help="processa lives novas de um canal (use no cron)")
    p_watch.add_argument("channel_url")
    p_watch.add_argument("--upload", action="store_true")

    args = parser.parse_args()
    cfg = Config()

    if args.cmd == "auth":
        from .youtube_upload import get_credentials
        get_credentials(cfg, interactive=True)
        print(f"Autorizado. Token salvo em {cfg.token_file}")
    elif args.cmd == "run":
        if args.max_clips:
            cfg.max_clips = args.max_clips
        if args.reframe:
            cfg.reframe_mode = args.reframe
        process(args.url, cfg, args.upload)
    elif args.cmd == "upload":
        upload_job(args.job_dir, cfg)
    elif args.cmd == "watch":
        watch(args.channel_url, cfg, args.upload)


if __name__ == "__main__":
    main()

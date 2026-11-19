"""Etapa 5: publicar os cortes no YouTube Shorts (YouTube Data API v3)."""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

from .config import Config

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


def get_credentials(cfg: Config, interactive: bool = False) -> Credentials:
    creds = None
    if cfg.token_file.exists():
        creds = Credentials.from_authorized_user_file(str(cfg.token_file), SCOPES)
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not interactive:
            raise RuntimeError("YouTube não autorizado. Rode primeiro: python -m cortes auth")
        if not cfg.client_secret_file.exists():
            raise RuntimeError(f"Coloque o arquivo OAuth do Google Cloud em {cfg.client_secret_file}")
        flow = InstalledAppFlow.from_client_secrets_file(str(cfg.client_secret_file), SCOPES)
        # Abre o navegador; em servidor sem tela, copie a URL impressa para o seu navegador
        creds = flow.run_local_server(port=8765, open_browser=True)
    cfg.token_file.parent.mkdir(parents=True, exist_ok=True)
    cfg.token_file.write_text(creds.to_json())
    return creds


def _metadata(clip: dict, cfg: Config, publish_at: datetime | None) -> dict:
    hashtags = [h.lstrip("#").replace(" ", "") for h in clip.get("hashtags", [])]
    title = clip["title"].strip()
    if "#shorts" not in title.lower():
        title = f"{title[:91]} #Shorts"
    description = clip.get("description", "").strip()
    if hashtags:
        description += "\n\n" + " ".join(f"#{h}" for h in hashtags)

    status = {"privacyStatus": cfg.privacy, "selfDeclaredMadeForKids": False}
    if publish_at:
        # Agendamento exige vídeo privado até a hora marcada
        status = {"privacyStatus": "private", "publishAt": publish_at.isoformat().replace("+00:00", "Z"),
                  "selfDeclaredMadeForKids": False}
    return {
        "snippet": {
            "title": title[:100],
            "description": description[:4900],
            "tags": (hashtags + cfg.extra_tags)[:30],
            "categoryId": cfg.category_id,
            "defaultLanguage": cfg.language,
            "defaultAudioLanguage": cfg.language,
        },
        "status": status,
    }


def upload_all(clips_dir: Path, clips: list[dict], cfg: Config) -> list[dict]:
    """Envia cortes aprovados que ainda não foram enviados. Guarda o estado em uploads.json."""
    state_file = clips_dir / "uploads.json"
    state = json.loads(state_file.read_text()) if state_file.exists() else {}
    youtube = build("youtube", "v3", credentials=get_credentials(cfg))

    next_slot = None
    if cfg.hours_between_posts > 0:
        next_slot = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(minutes=15)

    results = []
    for i, clip in enumerate(clips, start=1):
        key = f"{i:02d}"
        video = clips_dir / f"{key}.mp4"
        if not clip.get("approved", True):
            print(f"[youtube] {key} não aprovado, pulando")
            continue
        if key in state:
            print(f"[youtube] {key} já enviado: https://youtube.com/shorts/{state[key]['id']}")
            continue
        if not video.exists():
            print(f"[youtube] {key} sem arquivo de vídeo, pulando")
            continue

        body = _metadata(clip, cfg, next_slot)
        print(f"[youtube] enviando {key}: {body['snippet']['title']}")
        try:
            request = youtube.videos().insert(
                part="snippet,status", body=body,
                media_body=MediaFileUpload(str(video), mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True),
            )
            response = None
            while response is None:
                progress, response = request.next_chunk()
                if progress:
                    print(f"    {progress.progress() * 100:.0f}%")
        except HttpError as e:
            if e.resp.status == 403 and b"quotaExceeded" in e.content:
                print("[youtube] cota diária da API esgotada; o resto será enviado na próxima execução")
                break
            raise

        state[key] = {"id": response["id"], "title": body["snippet"]["title"],
                      "publish_at": body["status"].get("publishAt")}
        state_file.write_text(json.dumps(state, ensure_ascii=False, indent=2))
        print(f"    ok → https://youtube.com/shorts/{response['id']}")
        results.append(state[key])
        if next_slot:
            next_slot += timedelta(hours=cfg.hours_between_posts)
    return results

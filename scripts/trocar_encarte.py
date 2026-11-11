#!/usr/bin/env python3
"""Troca automática do encarte semanal em páginas Elementor.

Fluxo:
  1. Lê as imagens da pasta de entrada (padrão: encartes/entrada).
  2. Descobre os slots ("encarte-1", "encarte-2"...) marcados na página.
  3. Associa imagem -> slot (pelo nome do arquivo ou pela ordem alfabética).
  4. Sobe as imagens para a Biblioteca de Mídia e troca na página.

Configuração por variáveis de ambiente (ou arquivo .env na raiz do repositório):
  WP_URL           https://www.cliente.com.br
  WP_USER          usuário do WordPress
  WP_APP_PASSWORD  senha de aplicativo (Usuários > Perfil > Senhas de aplicativo)
  WP_PAGE_IDS      ID(s) da(s) página(s), separados por vírgula

Ou por cliente, com --cliente NOME (lê clientes/NOME.json). Nesse caso usuário e senha
vêm de <PREFIXO>_WP_USER e <PREFIXO>_WP_APP_PASSWORD, com o prefixo definido no JSON.

Se a página já mostra exatamente essas imagens (mesmo conteúdo), nada é enviado.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import mimetypes
import os
import re
import sys
import tempfile
from pathlib import Path

import requests

mimetypes.add_type("image/webp", ".webp")
REPO_ROOT = Path(__file__).resolve().parent.parent
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        sys.exit(f"ERRO: variável {name} não configurada (veja .env.example).")
    return value


class WordPress:
    def __init__(self, base_url: str, user: str, app_password: str) -> None:
        self.api = base_url.rstrip("/") + "/wp-json"
        self.session = requests.Session()
        self.session.auth = (user, app_password.replace(" ", ""))
        self.session.headers["User-Agent"] = "encarte-automatico/1.0"

    def _check(self, resp: requests.Response) -> dict:
        if resp.ok:
            return resp.json()
        try:
            message = resp.json().get("message", resp.text)
        except ValueError:
            message = resp.text[:300]
        sys.exit(f"ERRO {resp.status_code} em {resp.request.method} {resp.url}: {message}")

    def slots(self, page_id: int, ids: list[str] | None = None) -> list[dict]:
        params = {"page_id": page_id, "ids": ",".join(ids or [])}
        resp = self.session.get(f"{self.api}/encarte/v1/slots", params=params, timeout=60)
        return self._check(resp)["slots"]

    def upload(self, path: Path, filename: str, title: str) -> int:
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        resp = self.session.post(
            f"{self.api}/wp/v2/media",
            data=path.read_bytes(),
            headers={
                "Content-Type": mime,
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
            timeout=300,
        )
        media_id = self._check(resp)["id"]
        self._check(
            self.session.post(
                f"{self.api}/wp/v2/media/{media_id}",
                json={"title": title, "alt_text": title},
                timeout=60,
            )
        )
        return media_id

    def trocar(self, page_id: int, slots: dict[str, list[int]], notify: list[str]) -> dict:
        resp = self.session.post(
            f"{self.api}/encarte/v1/trocar",
            json={"page_id": page_id, "slots": slots, "notificar": notify},
            timeout=120,
        )
        return self._check(resp)


def natural_key(path: Path):
    return [int(p) if p.isdigit() else p.lower() for p in re.split(r"(\d+)", path.name)]


def find_images(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    return sorted(
        (p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS),
        key=natural_key,
    )


def content_tag(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def map_images_to_slots(images: list[Path], slots: list[dict], order: list[str] | None = None) -> dict[str, list[Path]]:
    """Arquivo cujo nome começa com o nome do slot vai para ele (ex.: encarte-2.jpg,
    encarte-galeria_03.png). Se nenhum arquivo usar esse padrão, distribui pela ordem
    alfabética: 1º arquivo -> 1º slot (da página, ou de `order` se informado), e assim por diante."""
    names = list(dict.fromkeys(s["slot"] for s in slots))
    if order:
        missing = [o for o in order if o not in names]
        if missing:
            sys.exit(f"ERRO: elemento(s) não encontrado(s) na página: {', '.join(missing)}")
        names = order
    multiple = {s["slot"] for s in slots if s["multiple"]}
    by_length = sorted(names, key=len, reverse=True)

    explicit: dict[str, list[Path]] = {}
    unmatched: list[Path] = []
    for image in images:
        stem = image.stem.lower()
        slot = next((n for n in by_length if stem == n or re.match(re.escape(n) + r"[\W_]", stem)), None)
        if slot:
            explicit.setdefault(slot, []).append(image)
        else:
            unmatched.append(image)

    if explicit:
        if unmatched:
            sys.exit(
                "ERRO: misture de arquivos nomeados e não nomeados. Renomeie estes para um slot "
                f"({', '.join(names)}): " + ", ".join(p.name for p in unmatched)
            )
        for slot, files in explicit.items():
            if len(files) > 1 and slot not in multiple:
                sys.exit(f"ERRO: o slot {slot} aceita só 1 imagem, mas recebeu {len(files)}.")
        return explicit

    if len(names) == 1 and names[0] in multiple:
        return {names[0]: images}

    if len(images) != len(names):
        sys.exit(
            f"ERRO: {len(images)} imagem(ns) para {len(names)} slot(s) na página ({', '.join(names)}). "
            "Ajuste a quantidade ou nomeie os arquivos com o nome do slot."
        )
    return {slot: [image] for slot, image in zip(names, images)}


def to_webp(image: Path, quality: int, workdir: Path) -> Path:
    """Converte para WebP (bem mais leve que JPG/PNG, mesma resolução). Requer Pillow."""
    from PIL import Image

    out = workdir / (image.stem + ".webp")
    with Image.open(image) as im:
        im.convert("RGB").save(out, "WEBP", quality=quality, method=6)
    return out


def already_published(plan: dict[str, list[Path]], slots: list[dict]) -> bool:
    current = {s["slot"]: s["atual"] for s in slots}
    return all(
        len(current.get(slot, [])) == len(files)
        and all(content_tag(f) in url for f, url in zip(files, current[slot]))
        for slot, files in plan.items()
    )


def load_client(name: str) -> dict:
    path = REPO_ROOT / "clientes" / f"{name}.json"
    if not path.is_file():
        sys.exit(f"ERRO: cliente {name} não configurado ({path} não existe).")
    config = json.loads(path.read_text(encoding="utf-8"))
    prefix = config["prefixo_credenciais"]
    os.environ.setdefault("WP_URL", config["wp_url"])
    os.environ.setdefault("WP_PAGE_IDS", ",".join(str(p) for p in config["paginas"]))
    for var in ("WP_USER", "WP_APP_PASSWORD"):
        if os.environ.get(f"{prefix}_{var}"):
            os.environ[var] = os.environ[f"{prefix}_{var}"]
        elif not os.environ.get(var):
            sys.exit(f"ERRO: variável {prefix}_{var} não configurada no ambiente.")
    return config


def main() -> None:
    load_dotenv(REPO_ROOT / ".env")

    parser = argparse.ArgumentParser(description="Troca as imagens do encarte nas páginas Elementor.")
    parser.add_argument("pasta", nargs="?", default=str(REPO_ROOT / "encartes" / "entrada"),
                        help="pasta com as imagens do encarte (padrão: encartes/entrada)")
    parser.add_argument("--cliente", help="usa a configuração de clientes/CLIENTE.json")
    parser.add_argument("--pagina", action="append", type=int,
                        help="ID da página (pode repetir). Padrão: WP_PAGE_IDS")
    parser.add_argument("--slots",
                        help="slots em ordem, separados por vírgula (classe encarte-* ou ID do elemento Elementor)")
    parser.add_argument("--dry-run", action="store_true",
                        help="só mostra o que seria trocado, sem subir nem salvar nada")
    parser.add_argument("--forcar", action="store_true",
                        help="publica mesmo que o site já mostre estas imagens")
    parser.add_argument("--listar-slots", action="store_true",
                        help="lista os slots encontrados em cada página e sai")
    args = parser.parse_args()

    order: list[str] | None = None
    notify: list[str] = []
    webp_quality: int | None = None
    if args.cliente:
        client = load_client(args.cliente)
        order = client.get("slots")
        notify = client.get("notificar", [])
        webp_quality = client.get("webp_qualidade")
    if args.slots:
        order = [s.strip() for s in args.slots.split(",") if s.strip()]

    wp = WordPress(env("WP_URL"), env("WP_USER"), env("WP_APP_PASSWORD"))
    page_ids = args.pagina or [int(p) for p in env("WP_PAGE_IDS").split(",") if p.strip()]

    if args.listar_slots:
        for page_id in page_ids:
            print(f"Página {page_id}:")
            for s in wp.slots(page_id, order):
                extra = " (várias imagens)" if s["multiple"] else ""
                print(f"  {s['slot']:<20} {s['type']}{extra}  atual: {', '.join(s['atual']) or '-'}")
        return

    images = find_images(Path(args.pasta))
    if not images:
        print(f"Nenhuma imagem em {args.pasta}. Nada a fazer.")
        return

    page_slots = {page_id: wp.slots(page_id, order) for page_id in page_ids}
    plans = {page_id: map_images_to_slots(images, page_slots[page_id], order) for page_id in page_ids}

    for page_id, plan in plans.items():
        print(f"Página {page_id}:")
        for slot, files in plan.items():
            print(f"  {slot:<20} <- {', '.join(f.name for f in files)}")

    pending = {p: plan for p, plan in plans.items() if args.forcar or not already_published(plan, page_slots[p])}
    if not pending:
        print("\nSEM_MUDANCA: o site já mostra exatamente estas imagens.")
        return
    if args.dry_run:
        print("\n--dry-run: nada foi enviado.")
        return

    today = dt.date.today()
    title = "Encarte " + today.strftime("%d/%m/%Y")
    workdir = Path(tempfile.mkdtemp(prefix="encarte-"))
    uploaded: dict[Path, int] = {}
    for image in dict.fromkeys(f for plan in pending.values() for files in plan.values() for f in files):
        # O nome leva o hash do arquivo original, para reconhecer depois que já foi publicado.
        to_send = to_webp(image, webp_quality, workdir) if webp_quality else image
        filename = f"encarte-{today:%Y%m%d}-{content_tag(image)}{to_send.suffix.lower()}"
        uploaded[image] = wp.upload(to_send, filename, title)
        print(f"Enviada {image.name} -> mídia #{uploaded[image]}")

    for page_id, plan in pending.items():
        result = wp.trocar(page_id, {slot: [uploaded[f] for f in files] for slot, files in plan.items()}, notify)
        print(f"\nPágina {page_id} atualizada: {result['url']}")
        for troca in result["trocas"]:
            print(f"  {troca['slot']}: {', '.join(troca['antes']) or '-'} -> {', '.join(troca['depois'])}")
        if result.get("email_enviado") is True:
            print(f"E-mail de confirmação enviado para: {', '.join(notify)}")
        elif result.get("email_enviado") is False:
            print("AVISO_EMAIL: o WordPress não conseguiu enviar o e-mail de confirmação.")


if __name__ == "__main__":
    main()

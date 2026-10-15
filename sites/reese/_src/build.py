#!/usr/bin/env python3
"""Monta as páginas do site a partir de _src/layout.html + _src/pages/*.html.

Uso: python3 sites/reese/_src/build.py
Cada página começa com um bloco de metadados:
<!--
title: ...
description: ...
active: inicio
body_class: page-light
-->
"""
import pathlib
import re

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent

NAV = [
    ("inicio", "index.html", "Início"),
    ("sobre", "sobre.html", "Sobre"),
    ("servicos", "servicos.html", "Serviços"),
    ("metodo", "como-funciona.html", "Como funciona"),
    ("depoimentos", "depoimentos.html", "Depoimentos"),
    ("contato", "contato.html", "Contato"),
]

# Atalhos usáveis dentro das páginas
SNIPPETS = {
    "arr": '<span class="arr"><svg aria-hidden="true"><use href="#arrow"/></svg></span>',
    "arrow": '<svg aria-hidden="true"><use href="#arrow"/></svg>',
    "mono": '<use href="#mono"/>',
}


def render(page: pathlib.Path, layout: str, mono_path: str) -> str:
    text = page.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).strip().splitlines():
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
        text = text[m.end():]
    active = meta.get("active", "")
    nav = "\n".join(
        f'          <li><a href="{href}"{" aria-current=\"page\"" if key == active else ""}>{label}</a></li>'
        for key, href, label in NAV
    )
    nav_mobile = "\n".join(
        f'        <li><a href="{href}"{" aria-current=\"page\"" if key == active else ""}>{label}</a></li>'
        for key, href, label in NAV
    )
    for k, v in SNIPPETS.items():
        text = text.replace("{{" + k + "}}", v)
    html = layout
    for k, v in {
        "title": meta.get("title", "Reese"),
        "description": meta.get("description", ""),
        "body_class": meta.get("body_class", ""),
        "nav": nav,
        "nav_mobile": nav_mobile,
        "mono_path": mono_path,
        "content": text.rstrip(),
    }.items():
        html = html.replace("{{" + k + "}}", v)
    return html


def main():
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    mono_path = (SRC / "monograma.path").read_text(encoding="utf-8").strip()
    for page in sorted((SRC / "pages").glob("*.html")):
        (OUT / page.name).write_text(render(page, layout, mono_path), encoding="utf-8")
        print("ok", page.name)


if __name__ == "__main__":
    main()

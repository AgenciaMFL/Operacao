#!/usr/bin/env python3
"""Gera uma prévia navegável do site inteiro em UM arquivo HTML (CSS, JS e
todas as páginas embutidos). Útil para enviar/abrir sem servidor.

Uso: python3 sites/reese/_src/preview.py [saida.html]
Rode depois do build.py.
"""
import json
import pathlib
import re
import sys

SRC = pathlib.Path(__file__).resolve().parent
SITE = SRC.parent
PAGES = ["index", "sobre", "servicos", "como-funciona", "depoimentos", "contato", "privacidade"]

ROUTER = r"""
<script>
(function () {
  var PAGES = __PAGES__;
  var main = document.getElementById("conteudo");
  var WA = "https://wa.me/5512991359788?text=" + encodeURIComponent("Olá! Vim pelo site e gostaria de agendar minha avaliação.");

  function init() {
    main.querySelectorAll("[data-wa]").forEach(function (a) { a.href = WA; a.target = "_blank"; a.rel = "noopener"; });
    var els = main.querySelectorAll(".reveal, .reveal-mask, .squiggle");
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });

    var links = main.querySelectorAll(".anchors a");
    if (links.length) {
      var map = {};
      links.forEach(function (a) { map[a.getAttribute("href").split("#")[1]] = a; });
      var so = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            links.forEach(function (a) { a.classList.remove("is-active"); });
            map[e.target.id].classList.add("is-active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
    }

    var form = main.querySelector("form.form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.classList.add("is-sent");
    });
  }

  function go(name, hash, push) {
    var p = PAGES[name];
    if (!p) return;
    main.innerHTML = p.html;
    document.body.className = p.cls + (document.body.classList.contains("menu-open") ? "" : "");
    document.title = p.title;
    document.querySelectorAll(".nav a, .menu a").forEach(function (a) {
      var t = (a.getAttribute("data-href") || a.getAttribute("href") || "").replace(/\.html.*/, "");
      if (t === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    init();
    if (push) { try { history.pushState({ p: name }, "", "#" + name + (hash ? "/" + hash : "")); } catch (e) {} }
    var target = hash && document.getElementById(hash);
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var m = (a.getAttribute("href") || "").match(/^([\w-]+)\.html(?:#([\w-]+))?$/);
    if (!m || !PAGES[m[1]]) return;
    e.preventDefault();
    go(m[1], m[2], true);
  });
  window.addEventListener("popstate", function () { route(); });

  function route() {
    var h = location.hash.replace(/^#/, "").split("/");
    if (PAGES[h[0]]) go(h[0], h[1], false);
  }
  route();
})();
</script>
"""


def extract(html: str, pattern: str) -> str:
    m = re.search(pattern, html, re.S)
    return m.group(1) if m else ""


def main():
    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else SITE / "preview.html"
    pages = {}
    for name in PAGES:
        html = (SITE / f"{name}.html").read_text(encoding="utf-8")
        pages[name] = {
            "html": extract(html, r'<main id="conteudo" class="header-overlay">(.*?)</main>'),
            "cls": extract(html, r'<body class="([^"]*)"'),
            "title": extract(html, r"<title>(.*?)</title>"),
        }
    base = (SITE / "index.html").read_text(encoding="utf-8")
    css = (SITE / "assets/css/style.css").read_text(encoding="utf-8")
    js = (SITE / "assets/js/main.js").read_text(encoding="utf-8")
    base = base.replace('<link rel="stylesheet" href="assets/css/style.css">', f"<style>{css}</style>")
    base = base.replace('<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">', "")
    data = json.dumps(pages, ensure_ascii=False).replace("</", "<\\/")
    base = base.replace('<script src="assets/js/main.js"></script>', f"<script>{js}</script>" + ROUTER.replace("__PAGES__", data))
    out.write_text(base, encoding="utf-8")
    print("ok", out)


if __name__ == "__main__":
    main()

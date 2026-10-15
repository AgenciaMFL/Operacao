(function () {
  var doc = document.documentElement;
  doc.classList.add("js");

  var WA_NUMBER = "5512991359788";
  var WA_TEXT = "Olá! Vim pelo site e gostaria de agendar minha avaliação.";

  // Links de WhatsApp: qualquer elemento com data-wa recebe o link com a mensagem pré-preenchida
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_TEXT);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Faixa sazonal
  var notice = document.querySelector(".notice");
  if (notice) {
    var hidden = false;
    try { hidden = sessionStorage.getItem("reese-notice") === "0"; } catch (e) {}
    if (hidden) notice.hidden = true;
    var close = notice.querySelector(".notice__close");
    if (close) close.addEventListener("click", function () {
      notice.hidden = true;
      try { sessionStorage.setItem("reese-notice", "0"); } catch (e) {}
    });
  }

  // Header sólido ao rolar
  var header = document.querySelector(".header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menu mobile
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // Revelar ao rolar
  var revealables = document.querySelectorAll(".reveal, .reveal-mask, .squiggle");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Âncoras da página de serviços
  var anchorLinks = document.querySelectorAll(".anchors a");
  if (anchorLinks.length && "IntersectionObserver" in window) {
    var map = {};
    anchorLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          anchorLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[en.target.id];
          a.classList.add("is-active");
          a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  // Formulário de contato: sem backend ainda, mostra a mensagem de sucesso
  // e abre o WhatsApp com os dados preenchidos.
  var form = document.querySelector("form.form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var msg = WA_TEXT +
        "\n\nNome: " + d.get("nome") +
        "\nWhatsApp: " + d.get("whatsapp") +
        "\nE-mail: " + d.get("email") +
        "\nÁrea de interesse: " + d.get("area") +
        (d.get("mensagem") ? "\nMensagem: " + d.get("mensagem") : "");
      form.classList.add("is-sent");
      form.querySelector(".form__success").focus();
      // TODO: integrar com CRM/e-mail. Por ora, o contato segue pelo WhatsApp.
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

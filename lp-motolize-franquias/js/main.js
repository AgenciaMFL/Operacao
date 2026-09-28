(function () {
  var cfg = window.MOTOLIZE_CONFIG || {};
  var QUALIFIED = ["250-449", "500+"];

  /* Revelar seções na rolagem */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* Formulário em 2 etapas */
  var form = document.getElementById("lead-form");
  if (!form) return;
  var steps = form.querySelectorAll(".form-step");
  var bars = form.querySelectorAll(".progress span");
  var phone = form.querySelector("#whatsapp");

  phone.addEventListener("input", function () {
    var d = phone.value.replace(/\D/g, "").slice(0, 11);
    var out = d;
    if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
    phone.value = out;
  });

  function validate(step) {
    var ok = true;
    step.querySelectorAll("input, select").forEach(function (el) {
      if (el.classList.contains("hp")) return;
      var v = el.value.trim();
      var valid = v !== "";
      if (valid && el.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (valid && el.id === "whatsapp") valid = v.replace(/\D/g, "").length >= 10;
      if (valid && el.id === "nome") valid = v.split(/\s+/).length >= 2;
      el.closest(".field").classList.toggle("invalid", !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    });
    return ok;
  }

  function show(i) {
    steps.forEach(function (s, idx) { s.hidden = idx !== i; });
    bars.forEach(function (b, idx) { b.classList.toggle("on", idx <= i); });
  }

  form.querySelector("[data-next]").addEventListener("click", function () {
    if (validate(steps[0])) { show(1); steps[1].querySelector("input").focus(); }
  });
  form.querySelector("[data-prev]").addEventListener("click", function () { show(0); });
  form.addEventListener("input", function (e) {
    var f = e.target.closest(".field");
    if (f) f.classList.remove("invalid");
  });

  function utms() {
    var p = new URLSearchParams(location.search), o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach(function (k) {
      if (p.get(k)) o[k] = p.get(k);
    });
    return o;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (steps[0].hidden === false) { form.querySelector("[data-next]").click(); return; }
    if (!validate(steps[1])) return;
    if (form.empresa.value) return; // honeypot

    var faixa = form.investimento.value;
    var qualificado = QUALIFIED.indexOf(faixa) !== -1;
    var lead = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      cidade: form.cidade.value.trim(),
      investimento: form.investimento.options[form.investimento.selectedIndex].text,
      qualificado: qualificado,
      origem: "LP Franquias",
      pagina: location.href,
      data: new Date().toISOString(),
      utm: utms()
    };

    var btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    btn.textContent = "ENVIANDO...";

    var jobs = [];
    if (qualificado && cfg.CRM_WEBHOOK_URL) {
      jobs.push(fetch(cfg.CRM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        keepalive: true
      }).catch(function () {}));
    }
    if (window.fbq) {
      if (qualificado) fbq("track", "Lead", { content_name: "Franquia Motolize", value: 0, currency: "BRL" });
      else fbq("trackCustom", "LeadNaoQualificado");
    }

    try { sessionStorage.setItem("motolize_lead", JSON.stringify({ nome: lead.nome, email: lead.email })); } catch (err) {}

    Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
      location.href = qualificado ? "obrigado.html" : "agradecimento.html";
    });
  });
})();

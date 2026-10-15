import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/shared/SEO";
import logo from "@/assets/meeky-logo.webp";
import { supabase } from "@/integrations/supabase/client";

const CNPJ = "Barganha Mix LTDA · CNPJ 43.341.597/0001-40";

function maskWhatsApp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Captação de interesse no lançamento do Motion 1.
 * Sem reserva e sem cobrança — apenas registro de quem quer ser avisado.
 */
const Motion1InteressePage = () => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utm, setUtm] = useState<{ s?: string; m?: string; c?: string }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    setUtm({
      s: p.get("utm_source") || undefined,
      m: p.get("utm_medium") || undefined,
      c: p.get("utm_campaign") || undefined,
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const digits = whatsapp.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Informe seu nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Informe um email válido.");
    if (digits.length < 10) return setError("Informe um WhatsApp válido com DDD.");
    if (!optIn) return setError("Você precisa autorizar o aviso de lançamento.");

    setLoading(true);
    const { error: insertError } = await supabase.from("motion1_interest").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: digits,
      marketing_opt_in: true,
      source: "home_bento",
      utm_source: utm.s ?? null,
      utm_medium: utm.m ?? null,
      utm_campaign: utm.c ?? null,
    });
    setLoading(false);

    if (insertError) {
      setError("Erro ao cadastrar. Tente novamente.");
      return;
    }
    setSuccess(true);
  }

  const inputCls =
    "w-full h-12 rounded-md border border-input bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO
        title="Motion 1 · Quero ser avisado do lançamento | Meeky"
        description="Deixe seu contato e seja avisado quando o Meeky Motion 1, fone de condução óssea open-ear, for lançado."
        canonical="https://meeky.com.br/motion-1"
        noindex
      />

      <header className="pt-8 pb-4 flex justify-center">
        <Link to="/" aria-label="Página inicial Meeky">
          <img src={logo} alt="Meeky" className="h-8 w-auto" loading="eager" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent border border-accent/30 px-3 py-1 text-xs font-medium mb-6">
            ✨ Motion 1 · Lançamento 2026
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Quero ser avisado do Motion 1
          </h1>
          <p className="text-muted-foreground mb-2">
            Bone Conduction · Open-Ear Sport. Deixe seu contato e avisamos assim que abrirmos as
            vendas.
          </p>
          <p className="text-sm text-muted-foreground/80 mb-8">
            Sem reserva e sem pagamento agora — só o aviso de lançamento.
          </p>

          {success ? (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 space-y-4">
              <p className="text-lg font-semibold">✅ Pronto! Você está na lista de aviso.</p>
              <p className="text-sm text-muted-foreground">
                Assim que o Motion 1 tiver data, você recebe o aviso primeiro.
              </p>
              <Link
                to="/headphone-anc-meeky-f5-pro"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold h-12 px-6 hover:bg-primary/90 transition-colors"
              >
                Conhecer o Meeky F5 ANC Pro
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="voce@email.com"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium mb-1.5">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(maskWhatsApp(e.target.value))}
                  className={inputCls}
                  placeholder="(11) 98765-4321"
                  maxLength={16}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <label className="flex items-start gap-3 text-xs text-muted-foreground/90 leading-relaxed cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-accent shrink-0"
                />
                <span>
                  Autorizo a Meeky a me avisar (WhatsApp e e-mail) sobre o lançamento do Motion 1.
                  Posso cancelar a qualquer momento.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Cadastrando..." : "Quero ser avisado"}
              </button>

              <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                Seus dados são usados apenas para avisar sobre o lançamento. Consulte a{" "}
                <a href="/privacidade" className="underline hover:text-accent">
                  Política de Privacidade
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/60 px-4">{CNPJ}</footer>
    </div>
  );
};

export default Motion1InteressePage;

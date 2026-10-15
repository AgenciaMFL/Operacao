import { useEffect, useState, FormEvent } from "react";
import SEO from "@/components/shared/SEO";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/meeky-logo.webp";

const ESPORTES = ["Corrida", "Ciclismo", "Cross Training", "Triathlon", "Academia", "Outro"];
const CANAIS = ["Site Meeky", "Mercado Livre", "Amazon", "Loja física", "Presente / outro"];

const PURPLE = "#1E1428";
const ORANGE = "#E8830A";
const MUTED = "#9B8DB8";

function maskWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const AtivarGarantiaPage = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [esporte, setEsporte] = useState("");
  const [canal, setCanal] = useState("");
  const [serie, setSerie] = useState("");
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setUtm({
      source: sp.get("utm_source") || undefined,
      medium: sp.get("utm_medium") || undefined,
      campaign: sp.get("utm_campaign") || undefined,
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim() || !email.trim() || !whatsapp.trim() || !esporte || !canal) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("E-mail inválido.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      setError("WhatsApp inválido.");
      return;
    }

    setLoading(true);
    const { error: dbError } = await supabase.from("warranty_leads").insert({
      produto: "Motion 1",
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim(),
      esporte,
      canal_compra: canal,
      numero_serie: serie.trim() || null,
      utm_source: utm.source ?? null,
      utm_medium: utm.medium ?? null,
      utm_campaign: utm.campaign ?? null,
    });
    setLoading(false);

    if (dbError) {
      setError("Ocorreu um erro. Tente novamente ou entre em contato com contato@meeky.com.br");
      return;
    }
    setSuccess(true);
  };

  const inputCls =
    "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#E8830A] focus:ring-1 focus:ring-[#E8830A] transition";

  return (
    <>
      <SEO
        title="Ative sua Garantia | MEEKY Motion 1"
        description="Ative os 2 anos de garantia do seu MEEKY Motion 1. Rápido e simples."
        noindex
      />
      <main
        className="min-h-screen w-full px-5 py-10 md:py-16 flex flex-col items-center"
        style={{ backgroundColor: PURPLE, color: "#FFFFFF" }}
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="MEEKY" className="h-8 w-auto" width={120} height={32} />
          </div>

          {!success ? (
            <>
              <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Ative sua Garantia</h1>
                <p
                  className="mt-3 italic text-base md:text-lg"
                  style={{ color: ORANGE }}
                >
                  Ouça o mundo. Liberdade em Movimento.
                </p>
                <p className="mt-4 text-sm" style={{ color: MUTED }}>
                  Preencha os dados abaixo para ativar 2 anos de garantia do seu Motion 1.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="nome" className="block text-sm mb-1.5" style={{ color: MUTED }}>
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={inputCls}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm mb-1.5" style={{ color: MUTED }}>
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm mb-1.5" style={{ color: MUTED }}>
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(maskWhatsapp(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className={inputCls}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label htmlFor="esporte" className="block text-sm mb-1.5" style={{ color: MUTED }}>
                    Qual esporte você pratica?
                  </label>
                  <select
                    id="esporte"
                    required
                    value={esporte}
                    onChange={(e) => setEsporte(e.target.value)}
                    className={inputCls}
                  >
                    <option value="" disabled style={{ color: "#000" }}>
                      Selecione...
                    </option>
                    {ESPORTES.map((s) => (
                      <option key={s} value={s} style={{ color: "#000" }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="canal" className="block text-sm mb-1.5" style={{ color: MUTED }}>
                    Onde comprou?
                  </label>
                  <select
                    id="canal"
                    required
                    value={canal}
                    onChange={(e) => setCanal(e.target.value)}
                    className={inputCls}
                  >
                    <option value="" disabled style={{ color: "#000" }}>
                      Selecione...
                    </option>
                    {CANAIS.map((s) => (
                      <option key={s} value={s} style={{ color: "#000" }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="serie" className="block text-sm mb-1.5" style={{ color: MUTED }}>
                    Número de série (opcional — está na embalagem)
                  </label>
                  <input
                    id="serie"
                    type="text"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-300 text-center" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-3.5 font-bold text-white transition disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ backgroundColor: ORANGE }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "ATIVAR GARANTIA"
                  )}
                </button>
              </form>
            </>
          ) : (
            <section className="text-center py-8" aria-live="polite">
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="h-20 w-20" style={{ color: ORANGE }} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Garantia ativada com sucesso!
              </h2>
              <p className="text-base mb-8" style={{ color: MUTED }}>
                Seu MEEKY Motion 1 está coberto por 2 anos. Enviamos a confirmação para o seu e-mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://instagram.com/meeky.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-white/20 px-4 py-3 text-sm font-medium hover:bg-white/5 transition"
                >
                  Seguir @meeky.br
                </a>
                <a
                  href="https://g.page/r/CSoQ83WbtkH3EBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-white/20 px-4 py-3 text-sm font-medium hover:bg-white/5 transition"
                >
                  ⭐ Deixar avaliação no Google
                </a>
                <a
                  href="https://meeky.com.br"
                  className="flex-1 rounded-lg border border-white/20 px-4 py-3 text-sm font-medium hover:bg-white/5 transition"
                >
                  Acessar o site
                </a>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default AtivarGarantiaPage;

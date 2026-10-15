import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Copy, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CheckoutPendingPage = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("payment_id");
  const orderIdFromUrl = searchParams.get("order_id");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load PIX payload — prefer sessionStorage (mobile-safe), fallback to URL params (legacy).
  const [pix, setPix] = useState<{ qr_code: string; qr_code_base64: string; order_id: string }>(() => {
    if (paymentId) {
      try {
        const raw = sessionStorage.getItem(`pix_${paymentId}`);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return {
      qr_code: searchParams.get("qr_code") || "",
      qr_code_base64: searchParams.get("qr_code_base64") || "",
      order_id: orderIdFromUrl || "",
    };
  });

  const orderId = pix.order_id || orderIdFromUrl;
  const qrCode = pix.qr_code;
  const qrCodeBase64 = pix.qr_code_base64;

  // Fallback: if QR image doesn't load in 3s, force-show the copia-e-cola section.
  useEffect(() => {
    if (!qrCodeBase64) {
      setShowFallback(true);
      return;
    }
    const t = setTimeout(() => {
      if (!imgLoaded) setShowFallback(true);
    }, 3000);
    return () => clearTimeout(t);
  }, [qrCodeBase64, imgLoaded]);

  // Poll order status every 5s for up to 30 min
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from("orders")
          .select("payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (data?.payment_status === "approved") {
          clearInterval(interval);
          try { sessionStorage.removeItem(`pix_${paymentId}`); } catch {}
          navigate(`/checkout/sucesso?payment_id=${paymentId}&status=approved`);
        }
      } catch (err) {
        console.error("[Polling] Error checking order status:", err);
      }
    }, 5000);

    const timeout = setTimeout(() => clearInterval(interval), 30 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId, paymentId, navigate]);

  const handleCopy = async () => {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast({ title: "Código Pix copiado!" });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older mobile browsers without clipboard API
      try {
        const ta = document.createElement("textarea");
        ta.value = qrCode;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        toast({ title: "Código Pix copiado!" });
        setTimeout(() => setCopied(false), 3000);
      } catch {
        toast({ title: "Erro ao copiar", variant: "destructive" });
      }
    }
  };

  return (
    <Layout>
      <SEO title="Pagamento Pendente | Meeky Audio" description="Seu pagamento via Pix está aguardando confirmação." />
      <section className="bg-background min-h-[70vh] flex items-center">
        <div className="container-wide section-padding py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-amber-500" />
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Aguardando pagamento Pix
            </h1>

            <p className="text-muted-foreground mb-8">
              Escaneie o QR Code ou copie o código Pix abaixo para finalizar o pagamento.
              <br />
              <strong className="text-foreground">Pague em até 30 minutos</strong> para garantir seu pedido.
            </p>

            {qrCodeBase64 && (
              <div className="bg-white rounded-lg p-6 inline-block mb-6 min-h-[240px] min-w-[240px] flex items-center justify-center">
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code Pix"
                  width={192}
                  height={192}
                  className="w-48 h-48 mx-auto"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setShowFallback(true)}
                />
              </div>
            )}

            {qrCode && (
              <div className="mb-8">
                <p className="text-sm text-foreground font-semibold mb-2">
                  {showFallback || !qrCodeBase64 ? "Use o código Pix (copia e cola):" : "Código Pix (copia e cola):"}
                </p>
                <div className="bg-secondary border border-border rounded-sm p-4 text-xs text-foreground break-all font-mono max-h-32 overflow-y-auto select-all">
                  {qrCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold rounded-sm hover:bg-gold-light transition-all"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? "Copiado!" : "Copiar código Pix"}
                </button>
              </div>
            )}

            {!qrCode && !qrCodeBase64 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-4 mb-6 text-sm text-destructive">
                Não recebemos o código Pix. Verifique seu e-mail ou{" "}
                <a href="/contato" className="underline font-semibold">entre em contato</a>.
              </div>
            )}

            {paymentId && (
              <p className="text-xs text-muted-foreground">
                ID do pagamento: {paymentId}
              </p>
            )}

            <p className="text-sm text-muted-foreground mt-6">
              Após o pagamento ser confirmado, você será redirecionado automaticamente.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPendingPage;

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("used");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("used");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {status === "loading" && (
            <p className="text-muted-foreground">Verificando...</p>
          )}
          {status === "valid" && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Cancelar inscrição</h1>
              <p className="text-muted-foreground">
                Deseja parar de receber e-mails da Meeky?
              </p>
              <button
                onClick={handleUnsubscribe}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Confirmar cancelamento
              </button>
            </>
          )}
          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Inscrição cancelada ✅</h1>
              <p className="text-muted-foreground">
                Você não receberá mais e-mails da Meeky. Sentiremos sua falta!
              </p>
            </>
          )}
          {status === "used" && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Já cancelado</h1>
              <p className="text-muted-foreground">
                Sua inscrição já foi cancelada anteriormente.
              </p>
            </>
          )}
          {status === "invalid" && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Link inválido</h1>
              <p className="text-muted-foreground">
                Este link de cancelamento é inválido ou expirou.
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Erro</h1>
              <p className="text-muted-foreground">
                Ocorreu um erro. Tente novamente mais tarde.
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UnsubscribePage;

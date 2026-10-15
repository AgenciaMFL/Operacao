import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Local typed wrapper for the beta `supabase.auth.oauth` namespace.
type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string; client_uri?: string };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResp<T> = { data: T | null; error: { message: string } | null };
type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResp<AuthorizationDetails>>;
  approveAuthorization: (id: string) => Promise<OAuthResp<AuthorizationDetails>>;
  denyAuthorization: (id: string) => Promise<OAuthResp<AuthorizationDetails>>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthAPI }).oauth;

function isSameOriginPath(p: string | null): p is string {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

export default function OAuthConsentPage() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/admin/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error: err } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) {
        setError(err.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: err } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    // Note: target is provided by the authorization server (Supabase) and
    // points at the OAuth client's registered redirect_uri.
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-3">
          <h1 className="text-2xl font-semibold">Não foi possível carregar</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }
  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  const clientName = details.client?.name ?? "um aplicativo";
  const scopes = (details.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-6 rounded-2xl border border-border p-8 bg-card">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Conectar {clientName} à sua conta Meeky</h1>
          <p className="text-muted-foreground text-sm">
            {clientName} poderá chamar as ferramentas do Meeky enquanto você estiver conectado.
            Isso não ignora as permissões e políticas do backend.
          </p>
        </div>
        {scopes.length > 0 && (
          <div className="text-sm">
            <p className="font-medium mb-1">Permissões solicitadas:</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {scopes.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="px-4 py-2 rounded-md border border-border text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            {busy ? "Aguarde…" : "Aprovar"}
          </button>
        </div>
      </div>
    </main>
  );
}

// Reference kept in case future logic needs it.
void isSameOriginPath;

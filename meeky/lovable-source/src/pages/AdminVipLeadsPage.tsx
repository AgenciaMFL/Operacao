import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Download, Search, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/meeky-logo.webp";

interface VipLead {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const csvEscape = (v: string | null | undefined) => {
  const s = String(v ?? "");
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const AdminVipLeadsPage = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<VipLead[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("vip-leads-list", {
        method: "POST",
        headers: { "x-vip-password": password },
      });
      if (invokeErr || !data?.leads) {
        setError("Acesso negado");
        setAuthed(false);
        return;
      }
      setLeads(data.leads as VipLead[]);
      setAuthed(true);
    } catch {
      setError("Acesso negado");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return leads;
    const q = query.toLowerCase();
    return leads.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.whatsapp?.toLowerCase().includes(q),
    );
  }, [leads, query]);

  const exportCsv = () => {
    const header = [
      "Nome",
      "WhatsApp",
      "Email",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Data de cadastro",
    ];
    const rows = leads.map((l) =>
      [
        l.name,
        l.whatsapp,
        l.email,
        l.utm_source,
        l.utm_medium,
        l.utm_campaign,
        formatDate(l.created_at),
      ]
        .map(csvEscape)
        .join(","),
    );
    const csv = "\uFEFF" + [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vip-leads-crosstraining-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado", description: `${leads.length} leads` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Lista VIP — Crosstraining Festival 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <img
            src={logo}
            alt="Meeky"
            width={120}
            height={32}
            className="h-7 w-auto invert dark:invert-0"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!authed ? (
          <div className="max-w-sm mx-auto mt-16">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={18} className="text-muted-foreground" />
                  <h1 className="text-lg font-semibold text-foreground">
                    Lista VIP — Crosstraining Festival 2026
                  </h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" className="w-full" disabled={loading || !password}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Entrar"}
                  </Button>
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Lista VIP — Crosstraining Festival 2026
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Total: {leads.length} {leads.length === 1 ? "lead cadastrado" : "leads cadastrados"}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Buscar por nome ou WhatsApp"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 w-full sm:w-72"
                  />
                </div>
                <Button onClick={exportCsv} variant="outline">
                  <Download size={16} className="mr-2" /> Exportar CSV
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome completo</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>UTM Medium</TableHead>
                      <TableHead>UTM Campaign</TableHead>
                      <TableHead>Data de cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum lead encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{l.name}</TableCell>
                          <TableCell>{l.whatsapp}</TableCell>
                          <TableCell className="text-sm">{l.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{l.utm_source || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{l.utm_medium || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{l.utm_campaign || "—"}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">{formatDate(l.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminVipLeadsPage;

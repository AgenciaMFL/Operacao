import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PartnerRedirectPage = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (!slug) return;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const fnUrl = `https://${projectId}.supabase.co/functions/v1/partner-redirect?slug=${encodeURIComponent(slug)}`;
    window.location.href = fnUrl;
  }, [slug]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-accent mx-auto" size={32} />
        <p className="text-muted-foreground text-sm">Redirecionando...</p>
      </div>
    </div>
  );
};

export default PartnerRedirectPage;

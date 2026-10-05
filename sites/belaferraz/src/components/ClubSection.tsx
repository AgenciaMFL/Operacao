import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Gift, Percent, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  { icon: Percent, title: "Descontos Exclusivos" },
  { icon: Gift, title: "Resgate de Prêmios" },
  { icon: Star, title: "Cashback" },
];

export const ClubSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Sucesso!",
      description: "Você receberá nossas novidades em breve.",
    });
    setEmail("");
  };

  return (
    <section id="clube" ref={ref} className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Clube Bela
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-4 mb-6">
              Faça parte do nosso clube de vantagens
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Baixe o app Clube Bela e aproveite descontos exclusivos, cashback 
              em todas as compras e resgate de prêmios incríveis.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 mb-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border"
                >
                  <benefit.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {benefit.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://apps.apple.com/br/app/clube-bela/id6752290576"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Baixar na App Store"
                  className="h-12"
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.crescevendas.belaferraz&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${import.meta.env.BASE_URL}google-play-badge.png`}
                  alt="Disponível no Google Play"
                  className="h-12"
                />
              </a>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card rounded-2xl p-8 md:p-10 border border-border"
          >
            <h3 className="font-display text-2xl text-foreground mb-4">
              Receba novidades exclusivas
            </h3>
            <p className="text-muted-foreground mb-6">
              Inscreva-se na nossa newsletter e receba ofertas exclusivas, 
              dicas de beleza e as últimas novidades da Bela Ferraz.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <Button type="submit" variant="hero" className="w-full" size="lg">
                Quero receber novidades
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Ao se inscrever, você concorda com nossa política de privacidade.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

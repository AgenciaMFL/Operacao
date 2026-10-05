import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Gift, Percent, Star, Award, Zap, Heart, Crown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const benefits = [
  {
    icon: Percent,
    title: "Descontos Exclusivos",
    description: "Acesse ofertas especiais disponíveis apenas para membros do clube.",
  },
  {
    icon: Gift,
    title: "Resgate de Prêmios",
    description: "Acumule pontos e troque por produtos incríveis.",
  },
  {
    icon: Star,
    title: "Cashback",
    description: "Ganhe dinheiro de volta em todas as suas compras.",
  },
  {
    icon: Crown,
    title: "Acesso VIP",
    description: "Seja o primeiro a saber de lançamentos e promoções.",
  },
  {
    icon: Heart,
    title: "Produtos Favoritos",
    description: "Salve seus produtos preferidos e receba alertas de ofertas.",
  },
  {
    icon: Zap,
    title: "Ofertas Relâmpago",
    description: "Descontos exclusivos por tempo limitado só para você.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Baixe o App",
    description: "Disponível para iOS e Android gratuitamente.",
  },
  {
    step: "2",
    title: "Cadastre-se",
    description: "Crie sua conta em menos de 2 minutos.",
  },
  {
    step: "3",
    title: "Aproveite",
    description: "Comece a acumular pontos e cashback imediatamente.",
  },
];



const ClubeBela = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <>
      <Helmet>
        <title>Clube Bela | Bela Ferraz Cosméticos</title>
        <meta
          name="description"
          content="Faça parte do Clube Bela e ganhe descontos exclusivos, cashback e prêmios incríveis. Baixe o app e comece a economizar hoje!"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-20 bg-foreground text-background relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            </div>
            
            <div className="container-wide relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
                    <Award size={16} />
                    Programa de Fidelidade
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                    Clube <span className="text-primary">Bela</span>
                  </h1>
                  <p className="text-lg text-background/70 mb-8">
                    O programa de vantagens exclusivo da Bela Ferraz. 
                    Ganhe cashback, descontos especiais e resgate prêmios incríveis 
                    a cada compra.
                  </p>
                  
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

              </div>
            </div>
          </section>

          {/* Benefits */}
          <section ref={ref} className="section-padding">
            <div className="container-wide">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Benefícios
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mt-4">
                  Vantagens exclusivas para você
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>



          {/* How it works */}
          <section className="section-padding">
            <div className="container-narrow">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Começar
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mt-4">
                  Como funciona?
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {howItWorks.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-display text-2xl flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center mt-16 bg-hero-gradient rounded-3xl p-12 text-primary-foreground"
              >
                <h3 className="font-display text-2xl md:text-3xl mb-4">
                  Comece a ganhar agora mesmo!
                </h3>
                <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                  Baixe o app Clube Bela e aproveite todos os benefícios exclusivos 
                  desde a primeira compra.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
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
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ClubeBela;

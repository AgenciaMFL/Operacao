import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Users, Award, Sparkles } from "lucide-react";
import storeImage from "@/assets/store-interior.jpg";

const features = [
  {
    icon: Heart,
    title: "Atendimento Acolhedor",
    description: "Consultoria personalizada por quem entende e te escuta de verdade.",
  },
  {
    icon: Award,
    title: "Melhores Marcas",
    description: "Curadoria das melhores marcas nacionais e internacionais.",
  },
  {
    icon: Users,
    title: "Experiência Única",
    description: "Do primeiro contato ao autocuidado em casa.",
  },
  {
    icon: Sparkles,
    title: "Preços Acessíveis",
    description: "Qualidade profissional com os melhores preços do mercado.",
  },
];

export const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sobre" ref={ref} className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
              <iframe
                className="w-full h-full"
                src="https://player-vz-56a7d893-7bf.tv.pandavideo.com.br/embed/?v=3e92e0bf-38a6-44cf-b05b-b8467d72acc1"
                title="Bela Ferraz - Conheça nossa história"
                style={{ border: 'none' }}
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                allowFullScreen
                // @ts-ignore
                fetchpriority="high"
              />
            </div>
            
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -bottom-6 -right-6 md:right-8 bg-card rounded-xl p-6 shadow-xl border border-border"
            >
              <div className="text-4xl font-display text-primary mb-1">+30</div>
              <div className="text-sm text-muted-foreground">Lojas no RJ</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Sobre nós
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-4 mb-6">
              Beleza vai muito além da estética
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Nossa missão é fazer com que você se sinta linda, confiante e cuidada 
              todos os dias. Na Bela Ferraz, acreditamos que beleza mora nos detalhes, 
              no autocuidado e na liberdade de ser quem você é.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Por isso, oferecemos uma experiência completa: com produtos que funcionam 
              e um atendimento que te acolhe com consultoria personalizada feita por 
              quem entende do assunto e te escuta de verdade.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

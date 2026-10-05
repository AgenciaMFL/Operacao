import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Clock, Phone } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "+33 Lojas",
    description: "Espalhadas pelo Rio de Janeiro",
  },
  {
    icon: Truck,
    title: "Delivery",
    description: "Entrega no conforto da sua casa",
  },
  {
    icon: Clock,
    title: "Atendimento",
    description: "Equipe treinada e atenciosa",
  },
  {
    icon: Phone,
    title: "App Clube Bela",
    description: "Descontos e cashback exclusivos",
  },
];

export const LocationsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="lojas" ref={ref} className="section-padding bg-hero-gradient text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
            Encontre uma loja perto de você
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Com mais de 30 lojas no Rio de Janeiro, a Bela Ferraz está sempre 
            perto de você para oferecer a melhor experiência em cosméticos.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-primary-foreground/10"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-primary-foreground/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="glass" size="xl" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <a href="https://belaferraz.com.br/enderecos" target="_blank" rel="noopener noreferrer">
              Ver todas as lojas
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

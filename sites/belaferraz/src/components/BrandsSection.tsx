import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const brands = [
  "L'Oréal",
  "Cadiveu",
  "Braé",
  "Widi Care",
  "Salon Line",
  "Lola Cosmetics",
  "Raavi",
  "Hidramais",
  "Depil Bella",
  "D'Água Natural",
  "Taiff",
  "Lizze",
  "Gama Italy",
  "Schwarzkopf",
];

export const BrandsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="parceiros" ref={ref} className="section-padding bg-secondary/30">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Marcas Parceiras
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-4 mb-6">
            As melhores marcas do mercado
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça nossas marcas parceiras voltadas para profissionais da beleza. 
            Linha completa para atender todos os profissionais do ramo.
          </p>
        </motion.div>

        {/* Brands Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
        >
          {brands.map((brand, index) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="bg-card rounded-xl p-6 flex items-center justify-center border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                {brand}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-block bg-card rounded-2xl p-8 md:p-12 border border-border">
            <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Canal Profissional
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg">
              Destinada a profissionais de salão de beleza que buscam oferecer 
              serviços de alta qualidade. Temos atendimento exclusivo e ofertas 
              especiais para você.
            </p>
            <Button variant="hero" size="lg" asChild>
              <a href="#clube">Entre no Clube Bela</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

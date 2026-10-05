import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import ceoImage from "@/assets/valeria-ferraz.png";

export const CEOSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-background overflow-hidden">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              CEO Bela Ferraz
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-4 mb-6">
              Valéria Ferraz
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Tudo começou com o olhar apaixonado de Valéria Ferraz. Empreendedora nata 
                e referência no universo da beleza, Valéria transformou sua paixão em 
                propósito: criar um espaço acessível, acolhedor e cheio de significado 
                para quem ama se cuidar.
              </p>
              <p>
                Com sensibilidade, visão de futuro e um profundo conhecimento do setor, 
                ela idealizou a Bela Ferraz como um lugar onde cada pessoa se sente ouvida, 
                bem atendida e valorizada de verdade.
              </p>
              <p>
                Foi dela também a ideia de unir a curadoria de grandes marcas e o atendimento 
                com consultoria personalizada para que cada cliente viva uma experiência 
                única do primeiro contato com o produto ao autocuidado em casa.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-10 pt-6 border-t border-border">
              <div className="font-display text-2xl text-foreground italic">
                "Beleza é liberdade de ser quem você é"
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                — Valéria Ferraz, Fundadora
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
              
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-md mx-auto lg:ml-auto">
                <img
                  src={ceoImage}
                  alt="Valéria Ferraz - CEO Bela Ferraz"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              </div>

              {/* Accent border */}
              <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-primary/20 rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

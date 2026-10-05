import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Gaby Guedes",
    text: "Já comprei vários produtos lá e todos são ótimos, o atendimento nem se fala, meninas super atenciosas! Voltarei sempre.",
    rating: 5,
  },
  {
    name: "Luciano Jorge",
    text: "O atendimento é muito bom, sempre compro nessa loja. Tem uma atendente chamada Elisangela que é super atenciosa, super indico!",
    rating: 5,
  },
  {
    name: "Adriana",
    text: "Lugar grande, variedades de produtos. Atendente muito atenciosa e me ajudou na escolha dos produtos e me deu explicações claras.",
    rating: 5,
  },
  {
    name: "Jacqueline",
    text: "Loja com enorme variedade de produtos para cabelos, unhas, maquiagem e até para esteticista, com bom preço e ainda tem salão de cabeleireiro!",
    rating: 5,
  },
  {
    name: "Luciano A.",
    text: "Muito bem atendido pela Renata. Super prestativa e ágil. Também gostei da sinceridade. É alguém que sabe do que está falando.",
    rating: 5,
  },
  {
    name: "Bruna Lobão",
    text: "Fui super bem atendida tanto pela vendedora quanto pelas pessoas do caixa. Encontrei o que eu precisava e os valores são bem acessíveis.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <section ref={ref} className="section-padding bg-foreground text-background overflow-hidden">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Depoimentos
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mt-4">
            O que os clientes dizem
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.name}-${currentIndex}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background/5 backdrop-blur-sm border border-background/10 rounded-2xl p-8 hover:bg-background/10 transition-colors"
              >
                <Quote className="w-10 h-10 text-primary mb-6" />
                
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-background/80 leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                <div className="font-semibold text-background">
                  {testimonial.name}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-background hover:border-background/40 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-background/30 hover:bg-background/50"
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-background hover:border-background/40 transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const stores = [
  { name: "Botafogo", address: "Rua Voluntários da Pátria, 231 - Botafogo", neighborhood: "Zona Sul" },
  { name: "Méier", address: "Rua Dias da Cruz, 273 - Méier", neighborhood: "Zona Norte" },
  { name: "Méier 2", address: "Rua Dias da Cruz, 160 - Méier", neighborhood: "Zona Norte" },
  { name: "Nilópolis", address: "Estrada Mirandela, 90 - Nilópolis", neighborhood: "Baixada Fluminense" },
  { name: "Madureira", address: "Rua Carvalho de Souza, 330 - Madureira", neighborhood: "Zona Norte" },
  { name: "Tijuca", address: "Rua Major Ávila, 116 - Tijuca", neighborhood: "Zona Norte" },
  { name: "Tijuca 2", address: "Rua Conde de Bonfim, 330 - Tijuca", neighborhood: "Zona Norte" },
  { name: "Ipanema", address: "Rua Visconde de Pirajá, 194 - Ipanema", neighborhood: "Zona Sul" },
  { name: "Ipanema 2", address: "Rua Visconde de Pirajá, 259 - Ipanema", neighborhood: "Zona Sul" },
  { name: "Ilha do Governador", address: "Estrada do Cacuia, 153 - Ilha do Governador", neighborhood: "Zona Norte" },
  { name: "Copacabana", address: "Av. Nossa Senhora de Copacabana, 750 - Copacabana", neighborhood: "Zona Sul" },
  { name: "Copacabana 2", address: "Av. Nossa Senhora de Copacabana, 592 - Copacabana", neighborhood: "Zona Sul" },
  { name: "Freguesia", address: "Estrada de Jacarepaguá, 7753 - Freguesia", neighborhood: "Zona Oeste" },
  { name: "Taquara", address: "Av. Nelson Cardoso, 267 - Taquara", neighborhood: "Zona Oeste" },
  { name: "Catete", address: "Rua do Catete, 261 - Catete", neighborhood: "Zona Sul" },
  { name: "Rio Comprido", address: "Rua Aristides Lobo, 246 - Rio Comprido", neighborhood: "Centro" },
  { name: "Bonsucesso", address: "Rua Cardoso de Moraes, 136 - Bonsucesso", neighborhood: "Zona Norte" },
  { name: "Norte Shopping", address: "Av. Dom Hélder Câmara, 5474 - Cachambi", neighborhood: "Zona Norte" },
  { name: "Itaboraí", address: "Avenida 22 de Maio, 5646 - Itaboraí", neighborhood: "Região Metropolitana" },
  { name: "Nova Friburgo", address: "Avenida Alberto Braune, 23 - Nova Friburgo", neighborhood: "Região Serrana" },
  
  { name: "Petrópolis 2", address: "Rua do Imperador, 607 - Petrópolis", neighborhood: "Região Serrana" },
  { name: "Rio das Ostras", address: "Av. Novo Rio das Ostras, 5021 - Rio das Ostras", neighborhood: "Região dos Lagos" },
  { name: "Rio das Ostras 2", address: "Rod. Amaral Peixoto, 4789 - Rio das Ostras", neighborhood: "Região dos Lagos" },
  { name: "Angra dos Reis", address: "Rua do Comércio, 221 - Angra dos Reis", neighborhood: "Costa Verde" },
  { name: "Magé", address: "Rua Doutor Siqueira, 411 - Magé", neighborhood: "Baixada Fluminense" },
  { name: "Macaé", address: "Av. Rui Barbosa, 467 - Macaé", neighborhood: "Norte Fluminense" },
  { name: "Macaé 2", address: "Av. Rui Barbosa, 701 - Macaé", neighborhood: "Norte Fluminense" },
  { name: "Maricá", address: "Praça Conselheiro Macedo Soares, 89 - Maricá", neighborhood: "Região Metropolitana" },
  { name: "Belford Roxo", address: "Rua João Fernandes Neto, 1345 - Belford Roxo", neighborhood: "Baixada Fluminense" },
  { name: "Barra Mansa", address: "Av. Joaquim Leite, 312 Lj 02 - Barra Mansa", neighborhood: "Sul Fluminense" },
  { name: "Três Rios", address: "Rua Prefeito Walter Francklin, 130 - Três Rios", neighborhood: "Centro-Sul Fluminense" },
  { name: "São Gonçalo", address: "Rua Dr. Feliciano Sodré, 217 - São Gonçalo", neighborhood: "Região Metropolitana" },
];

const neighborhoods = ["Todos", "Centro", "Zona Sul", "Zona Norte", "Zona Oeste", "Baixada Fluminense", "Região Metropolitana", "Região Serrana", "Região dos Lagos", "Norte Fluminense", "Costa Verde", "Sul Fluminense", "Centro-Sul Fluminense"];

const Lojas = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <>
      <Helmet>
        <title>Nossas Lojas | Bela Ferraz Cosméticos</title>
        <meta
          name="description"
          content="Encontre a loja Bela Ferraz mais perto de você. +30 lojas espalhadas pelo Rio de Janeiro com as melhores marcas de cosméticos."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-16 bg-hero-gradient text-primary-foreground">
            <div className="container-wide">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                  Nossas Lojas
                </h1>
                <p className="text-lg text-primary-foreground/80">
                  Com mais de 30 lojas espalhadas pelo Rio de Janeiro, 
                  a Bela Ferraz está sempre perto de você.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-12 bg-secondary/30">
            <div className="container-wide">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { number: "33", label: "Lojas" },
                  { number: "+500", label: "Colaboradores" },
                  { number: "+1000", label: "Produtos" },
                  { number: "100%", label: "Satisfação" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-display text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Stores List */}
          <section ref={ref} className="section-padding">
            <div className="container-wide">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  Encontre uma loja
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Selecione sua região para encontrar a loja mais próxima de você.
                </p>
              </motion.div>

              {/* Filter Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
              >
                {neighborhoods.map((neighborhood) => (
                  <button
                    key={neighborhood}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    {neighborhood}
                  </button>
                ))}
              </motion.div>

              {/* Stores Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store, index) => (
                  <motion.div
                    key={store.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          {store.neighborhood}
                        </span>
                        <h3 className="font-semibold text-lg text-foreground mt-1">
                          {store.name}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MapPin size={18} className="text-primary group-hover:text-primary-foreground" />
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground mb-6">
                      <div className="flex items-start gap-3">
                        <Navigation size={16} className="flex-shrink-0 mt-0.5 text-primary" />
                        <span>{store.address}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(store.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver no mapa
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </div>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Lojas;
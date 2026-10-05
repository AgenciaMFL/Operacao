import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Truck, Clock, MapPin, CreditCard, Package, CheckCircle, Phone, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

const deliveryFeatures = [
  {
    icon: Truck,
    title: "Entrega Rápida",
    description: "Receba seu pedido em até 24h úteis na maioria das regiões do Rio de Janeiro.",
  },
  {
    icon: Package,
    title: "Embalagem Segura",
    description: "Produtos embalados com cuidado para chegarem perfeitos até você.",
  },
  {
    icon: CreditCard,
    title: "Pagamento Fácil",
    description: "Pague com Pix, cartão de crédito ou débito na entrega.",
  },
  {
    icon: MapPin,
    title: "Ampla Cobertura",
    description: "Atendemos diversas regiões do Rio de Janeiro e Grande Rio.",
  },
];

const steps = [
  {
    number: "01",
    title: "Entre em contato",
    description: "Fale conosco pelo WhatsApp ou telefone e faça seu pedido.",
  },
  {
    number: "02",
    title: "Escolha os produtos",
    description: "Nossa equipe te ajuda a encontrar os melhores produtos para você.",
  },
  {
    number: "03",
    title: "Confirme o pagamento",
    description: "Escolha a forma de pagamento mais conveniente para você.",
  },
  {
    number: "04",
    title: "Receba em casa",
    description: "Aguarde seu pedido no conforto da sua casa.",
  },
];

const regions = [
  "Centro",
  "Zona Sul (Copacabana, Ipanema, Leblon, Botafogo)",
  "Zona Norte (Tijuca, Méier, Madureira, Penha)",
  "Zona Oeste (Barra da Tijuca, Recreio, Campo Grande)",
  "Niterói e São Gonçalo",
  "Baixada Fluminense",
];

const Delivery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [cep, setCep] = useState("");
  const { toast } = useToast();

  const handleCheckCep = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Ótima notícia!",
      description: "Entregamos na sua região! Entre em contato para fazer seu pedido.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Delivery | Bela Ferraz Cosméticos</title>
        <meta
          name="description"
          content="Peça seus cosméticos favoritos pelo delivery da Bela Ferraz. Entrega rápida em todo Rio de Janeiro com as melhores marcas."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-20 bg-hero-gradient text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }} />
            </div>
            
            <div className="container-wide relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-medium mb-6">
                    <Truck size={16} />
                    Entrega em todo RJ
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                    Delivery Bela Ferraz
                  </h1>
                  <p className="text-lg text-primary-foreground/80 mb-8">
                    Receba seus cosméticos favoritos no conforto da sua casa. 
                    Atendemos diversas regiões do Rio de Janeiro com entrega rápida e segura.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="glass" 
                      size="xl" 
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      asChild
                    >
                      <a
                        href="https://wa.me/5521990895233?text=Olá! Gostaria de fazer um pedido pelo delivery."
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Pedir pelo WhatsApp
                      </a>
                    </Button>
                    <Button 
                      variant="heroOutline" 
                      size="xl" 
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                      asChild
                    >
                      <a href="tel:+5521990895233">
                        <Phone className="w-5 h-5 mr-2" />
                        Ligar agora
                      </a>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/20"
                >
                  <h3 className="font-display text-2xl mb-4">Consulte sua região</h3>
                  <p className="text-primary-foreground/70 text-sm mb-6">
                    Digite seu CEP para verificar se entregamos na sua região.
                  </p>
                  <form onSubmit={handleCheckCep} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Digite seu CEP"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                    />
                    <Button type="submit" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" size="lg">
                      Consultar
                    </Button>
                  </form>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section ref={ref} className="section-padding">
            <div className="container-wide">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Vantagens
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mt-4">
                  Por que pedir pelo Delivery?
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {deliveryFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="bg-card rounded-2xl p-6 border border-border text-center hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="section-padding bg-secondary/30">
            <div className="container-wide">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Como funciona
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mt-4">
                  Pedir é muito fácil
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="text-6xl font-display text-primary/20 mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-1/2" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Coverage Areas */}
          <section className="section-padding">
            <div className="container-narrow">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Cobertura
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mt-4 mb-4">
                  Regiões atendidas
                </h2>
                <p className="text-muted-foreground">
                  Confira as regiões onde fazemos entrega.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {regions.map((region, index) => (
                  <div
                    key={region}
                    className={`flex items-center gap-4 p-5 ${
                      index !== regions.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{region}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center mt-12"
              >
                <Button variant="hero" size="xl" asChild>
                  <a
                    href="https://wa.me/5521990895233?text=Olá! Gostaria de fazer um pedido pelo delivery."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Fazer meu pedido
                  </a>
                </Button>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Delivery;

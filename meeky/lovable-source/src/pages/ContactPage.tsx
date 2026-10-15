import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const contactPageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://meeky.com.br/contato",
      name: "Fale com a Meeky",
      description:
        "Fale com a Meeky Audio: suporte técnico via WhatsApp, comercial B2B e parcerias. Resposta em minutos. São Paulo, Brasil.",
      url: "https://meeky.com.br/contato",
      inLanguage: "pt-BR",
      isPartOf: { "@id": "https://meeky.com.br/#organization" },
      mainEntity: { "@id": "https://meeky.com.br/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://meeky.com.br/#organization",
      name: "Meeky Audio",
      legalName: "Barganha Mix Ltda",
      url: "https://meeky.com.br/",
      email: "contato@meeky.com.br",
      telephone: "+55-12-99107-4311",
      taxID: "43.341.597/0001-40",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jacareí",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      sameAs: ["https://www.instagram.com/meeky.br"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: "+55-12-99107-4311",
          email: "suporte@meeky.com.br",
          areaServed: "BR",
          availableLanguage: ["Portuguese"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "comercial@meeky.com.br",
          areaServed: "BR",
          availableLanguage: ["Portuguese"],
        },
        {
          "@type": "ContactPoint",
          contactType: "partnerships",
          email: "parceria@meeky.com.br",
          areaServed: "BR",
          availableLanguage: ["Portuguese"],
        },
      ],
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Contato", url: "https://meeky.com.br/contato" },
]);

const ContactPage = () => {

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Olá! Me chamo ${formData.name}. Assunto: ${formData.subject}. ${formData.message}`;
    window.location.href = `mailto:contato@meeky.com.br?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(msg)}`;
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <Layout>
      <SEO title="Fale com a Meeky — Suporte, dúvidas e atendimento" description="Fale com a Meeky Audio: suporte técnico rápido via WhatsApp, comercial B2B e parcerias. Resposta em minutos. São Paulo, Brasil." canonical="https://meeky.com.br/contato" />
      <JsonLd data={contactPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      {/* Hero */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-24 md:py-32">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Contato</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
              Fale com a Meeky
            </h1>
            <p className="text-lg text-primary-foreground/60 max-w-xl mx-auto">
              Dúvidas, parcerias, imprensa ou suporte. Estamos aqui para ajudar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-6">Informações</h2>
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: "E-mail", value: "contato@meeky.com.br", href: "mailto:contato@meeky.com.br" },
                    { icon: Phone, label: "Telefone", value: "(12) 99107-4311", href: "tel:+5512991074311" },
                    { icon: MapPin, label: "Localização", value: "São Paulo, Brasil" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <item.icon size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departamentos */}
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-4">Departamentos</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Suporte ao cliente</p>
                    <a href="mailto:suporte@meeky.com.br" className="text-foreground hover:text-accent transition-colors">suporte@meeky.com.br</a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Comercial e parcerias</p>
                    <a href="mailto:comercial@meeky.com.br" className="text-foreground hover:text-accent transition-colors block">comercial@meeky.com.br</a>
                    <a href="mailto:parceria@meeky.com.br" className="text-foreground hover:text-accent transition-colors block">parceria@meeky.com.br</a>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-4">Redes Sociais</h3>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com/meeky.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-2">@meeky.br</p>
              </div>
            </div>

            {/* Form */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">Nome</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">E-mail</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">Assunto</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                    placeholder="Dúvida, parceria, suporte..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">Mensagem</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                    placeholder="Escreva sua mensagem..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  ENVIAR MENSAGEM <Send size={16} />
                </button>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Usamos seus dados apenas para responder a esta mensagem de contato. Consulte a{" "}
                  <a href="/privacidade" className="underline hover:text-accent">Política de Privacidade</a>.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compra Segura */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Compra segura</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Compra segura com tecnologia e suporte especializado.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Empresa responsável: <span className="text-foreground font-medium">Barganha Mix Ltda</span></p>
              <p>CNPJ: 43.341.597/0001-40</p>
              <p className="pt-2">
                Dúvidas? <a href="mailto:suporte@meeky.com.br" className="text-accent hover:underline">suporte@meeky.com.br</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;

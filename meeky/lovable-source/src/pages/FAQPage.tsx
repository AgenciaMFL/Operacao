import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import CTASection from "@/components/shared/CTASection";
import SEO from "@/components/shared/SEO";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const WHATSAPP_URL = "https://wa.me/5512991074311?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20meu%20Meeky";

const categories = [
  {
    title: "Perguntas antes de comprar",
    items: [
      { q: "Quanto custa o Meeky F5 ANC Pro?", a: "R$ 297 à vista, com frete grátis para todo o Brasil e garantia de 12 meses. Pagamento via cartão, PIX ou boleto pelo Mercado Pago." },
      { q: "Qual a diferença do Meeky ANC Pro para outros headphones?", a: "O Meeky ANC Pro oferece cancelamento de ruído ativo híbrido com 4 microfones, driver de 40mm, até 70h de bateria e design premium minimalista — tudo por um preço acessível." },
      { q: "O headphone é resistente à água?", a: "Possui certificação IPX4, resistente a respingos e suor leve. Ideal para treinos." },
      { q: "Posso usar com fio?", a: "Sim. Acompanha cabo P2 para uso com fio, funcionando mesmo sem bateria." },
      { q: "Quais codecs de áudio suporta?", a: "AAC, SBC e LDAC para qualidade de áudio superior em dispositivos compatíveis." },
    ],
  },
  {
    title: "Envio e Entrega",
    items: [
      { q: "Qual o prazo de entrega?", a: "Enviamos em até 1 dia útil (Envio Full). A entrega leva de 2 a 5 dias úteis dependendo da região." },
      { q: "Quanto custa o frete?", a: "Frete grátis para todo o Brasil em todas as compras, com rastreio completo e seguro — Envio Full SP." },
      { q: "Como rastreio meu pedido?", a: "Você receberá o código de rastreamento por e-mail assim que o pedido for despachado." },
    ],
  },
  {
    title: "Pagamento",
    items: [
      { q: "Quais formas de pagamento são aceitas?", a: "Cartão de crédito, PIX e boleto bancário via Mercado Pago." },
      { q: "O pagamento é seguro?", a: "Sim. Utilizamos criptografia SSL e processamento via Mercado Pago, com proteção total ao comprador." },
    ],
  },
  {
    title: "Garantia e Devoluções",
    items: [
      { q: "Qual o prazo de garantia?", a: "12 meses de garantia contra defeitos de fabricação. O Meeky F5 ANC Pro possui certificação Anatel para venda regular no Brasil, garantindo suporte e reposição em território nacional." },
      { q: "Como acionar a garantia?", a: "Entre em contato pelo WhatsApp ou e-mail. Resolveremos em até 48h." },
      { q: "Posso devolver se não gostar?", a: "Sim. Você tem 7 dias para devolução após o recebimento, conforme o CDC." },
    ],
  },
  {
    title: "Uso e Compatibilidade",
    items: [
      { q: "Como ativar o cancelamento de ruído?", a: "Pressione o botão dedicado na lateral esquerda. Alterne entre ANC, modo ambiente e desligado." },
      { q: "Posso conectar em dois dispositivos?", a: "Sim. O Bluetooth 5.4 com multipoint permite conexão simultânea." },
      { q: "Quanto tempo leva para carregar?", a: "Carga completa em 2h via USB-C. 10 minutos de carga = 3 horas de uso." },
      { q: "Como resetar o Meeky?", a: "Mantenha pressionados os botões de volume + e - por 5 segundos até o LED piscar. Pronto, o fone está resetado." },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: categories.flatMap((cat) =>
    cat.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Dúvidas Frequentes", url: "https://meeky.com.br/faq" },
]);

const FAQPage = () => {

  return (
    <Layout>
      <SEO title="FAQ Meeky F5 ANC Pro — Bateria, ANC, garantia e envio" description="Tire suas dúvidas sobre cancelamento de ruído, Bluetooth 5.4, bateria de 70h, envio Full em 24h, garantia de 12 meses e uso do headphone Meeky F5 ANC Pro." canonical="https://meeky.com.br/faq" />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className="bg-primary">
        <div className="container-wide section-padding py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Suporte</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
              Central de Ajuda e Dúvidas Frequentes
            </h1>
            <p className="text-lg text-primary-foreground/60 max-w-xl mx-auto">
              Reunimos aqui as dúvidas mais comuns sobre o Meeky F5 ANC Pro — antes de comprar, sobre entrega, garantia e uso. Cada resposta é direta, baseada nas especificações reais do produto e nas políticas oficiais da Meeky. Se não encontrar sua dúvida aqui, fale com a gente pelo WhatsApp ou e-mail.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto space-y-16">
            {categories.map((cat, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-8 pb-3 border-b border-border">{cat.title}</h2>
                <div className="space-y-8">
                  {cat.items.map((item, i) => (
                    <article key={i} className="space-y-2">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {item.q}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-semibold text-accent hover:underline"
                      >
                        Ainda tem dúvida? Fale no WhatsApp →
                      </a>
                    </article>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ainda tem dúvidas?"
        subtitle="Fale com a gente pelo WhatsApp. Respondemos em minutos."
        buttonText="FALAR NO WHATSAPP"
        buttonLink={WHATSAPP_URL}
      />
    </Layout>
  );
};

export default FAQPage;

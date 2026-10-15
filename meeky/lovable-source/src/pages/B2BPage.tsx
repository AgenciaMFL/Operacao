import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Users,
  Building2,
  GraduationCap,
  Gift,
  Focus,
  BatteryFull,
  Music2,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Send,
  CheckCircle2,

} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Layout from "@/components/layout/Layout";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Empresas", url: "https://meeky.com.br/empresas" },
]);
import SectionHeading from "@/components/shared/SectionHeading";
import SEO from "@/components/shared/SEO";
import ProductFAQ from "@/components/product/ProductFAQ";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import urbanImg from "@/assets/lifestyle-urban-touch.webp";

const WHATSAPP_URL = "https://wa.me/5512991074311";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "hotmail.com.br",
  "yahoo.com",
  "yahoo.com.br",
  "outlook.com",
  "outlook.com.br",
  "icloud.com",
  "live.com",
  "bol.com.br",
  "uol.com.br",
  "terra.com.br",
  "msn.com",
  "me.com",
];

const formSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(120),
  empresa: z.string().trim().min(2, "Informe o nome da empresa").max(120),
  cargo: z.string().min(1, "Selecione seu cargo / área"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(180)
    .refine((val) => {
      const domain = val.split("@")[1]?.toLowerCase() ?? "";
      return !PERSONAL_EMAIL_DOMAINS.includes(domain);
    }, "Use um e-mail corporativo (não pessoal)"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Informe o WhatsApp com DDD")
    .max(20)
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, "WhatsApp inválido (use DDD + número)"),
  quantidade: z.string().min(1, "Selecione a quantidade estimada"),
  finalidade: z.string().min(1, "Selecione a finalidade"),
  prazo: z.string().min(1, "Selecione o prazo desejado"),
  personalizacao: z.string().optional(),
  mensagem: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const audienceCards = [
  {
    icon: Code2,
    title: "Empresas de tecnologia e startups",
    desc: "Equipes que vivem entre reuniões, foco profundo, calls e ambientes compartilhados. O ANC elimina distração e o Bluetooth multiponto conecta notebook e celular ao mesmo tempo.",
  },
  {
    icon: Users,
    title: "RH e people experience",
    desc: "Kits de onboarding, ações internas, campanhas de reconhecimento e presentes de fim de ano. Produto com alto valor percebido e uso real no dia a dia.",
  },
  {
    icon: Building2,
    title: "Coworkings e escritórios compartilhados",
    desc: "Para criar uma experiência premium em salas, estações de trabalho e áreas de foco. Bateria de 70h — nenhum colaborador fica sem fone durante o expediente.",
  },
  {
    icon: GraduationCap,
    title: "Escolas de programação e educação tech",
    desc: "Para alunos, instrutores, turmas premium, premiações e kits de boas-vindas. Produto que reforça o posicionamento da escola como referência em qualidade.",
  },
  {
    icon: Gift,
    title: "Eventos, ativações e presentes corporativos",
    desc: "Um brinde tecnológico útil, com valor percebido alto e uso real depois do evento. Alternativa premium aos brindes genéricos.",
  },
];

const whyItems = [
  {
    icon: Focus,
    title: "Foco no trabalho",
    desc: "Cancelamento de ruído ativo de até 20dB reduz distração em ambientes com conversas, ar-condicionado, trânsito e ruídos constantes de open office e home office.",
  },
  {
    icon: BatteryFull,
    title: "Bateria para a semana inteira",
    desc: "70 horas de bateria — menos interrupções e recargas durante a semana. Em uso típico de 8h por dia, dura quase 9 dias sem recarregar.",
  },
  {
    icon: Music2,
    title: "Qualidade de áudio profissional",
    desc: "Suporte a LDAC — codec de alta resolução compatível com Android e dispositivos Sony. Som superior para calls, música e conteúdo em geral.",
  },
  {
    icon: Sparkles,
    title: "Produto com alta percepção de valor",
    desc: "Um kit de onboarding ou presente corporativo que não vai para a gaveta. É usado, comentado e recomendado pelos colaboradores.",
  },
  {
    icon: ShieldCheck,
    title: "Compra nacional, suporte direto",
    desc: "Atendimento em português, nota fiscal, garantia de 12 meses com suporte via WhatsApp e e-mail. Sem burocracia de importação.",
  },
  {
    icon: BadgeCheck,
    title: "Certificação Anatel",
    desc: "Único headphone ANC nessa faixa de preço homologado pela Anatel — conformidade regulatória para a TI da sua empresa.",
  },
];

const steps = [
  "Você preenche o formulário com empresa, quantidade estimada e finalidade.",
  "Nossa equipe comercial analisa e envia uma proposta personalizada em até 24 horas úteis.",
  "Validamos forma de pagamento, nota fiscal, prazo e personalização (se houver).",
  "Seu pedido é separado, embalado e enviado com rastreamento.",
  "Sua empresa conta com suporte pós-venda direto no Brasil — garantia de 12 meses para todas as unidades.",
];

const volumeTiers = [
  {
    range: "20 a 49 unidades",
    benefits: "Nota fiscal + suporte B2B direto + garantia 12 meses para todas as unidades",
  },
  {
    range: "50 a 99 unidades",
    benefits: "Tudo do anterior + condição comercial progressiva + entrega prioritária",
  },
  {
    range: "100 a 199 unidades",
    benefits: "Tudo do anterior + personalização de embalagem avaliada + condição especial",
  },
  {
    range: "200+ unidades",
    benefits: "Proposta personalizada + gerente de conta dedicado + condições de pagamento flexíveis",
  },
];

const trustItems = [
  {
    title: "Empresa brasileira",
    desc: "Operado por Barganha Mix Ltda — CNPJ 43.341.597/0001-40. Nota fiscal e suporte local.",
  },
  {
    title: "Garantia de 12 meses no Brasil",
    desc: "Suporte direto da Meeky, sem intermediário e sem envio ao exterior.",
  },
  {
    title: "Certificação Anatel",
    desc: "Homologado para uso e comercialização legal no Brasil.",
  },
];


const faqItems = [
  {
    q: "Qual o pedido mínimo?",
    a: "20 unidades. Empresas avaliando compras corporativas podem solicitar condições especiais de amostra para teste interno mediante contato com nosso time comercial.",
  },
  {
    q: "A Meeky emite nota fiscal?",
    a: "Sim. Todas as compras corporativas são realizadas com emissão de nota fiscal pela Barganha Mix Ltda — CNPJ 43.341.597/0001-40.",
  },
  {
    q: "Quais são as formas de pagamento para CNPJ?",
    a: "Cartão de crédito (até 6x), PIX e boleto bancário. Para pedidos acima de R$5.000, avaliamos condições de pagamento fracionado.",
  },
  {
    q: "Qual o prazo de entrega para pedidos corporativos?",
    a: "Depende da quantidade, região e disponibilidade de estoque. Para São Paulo, entrega em até 24h para pedidos de até 30 unidades em estoque. Após o formulário, nossa equipe informa a previsão exata junto com a proposta.",
  },
  {
    q: "A garantia vale para todas as unidades do pedido?",
    a: "Sim. Garantia de 12 meses contra defeitos de fabricação para todas as unidades. Em caso de defeito, o processo de troca é iniciado diretamente com a Meeky via WhatsApp ou e-mail.",
  },
  {
    q: "É possível personalizar a embalagem com a logo da empresa?",
    a: "Avaliamos personalização de embalagem e kit conforme quantidade e disponibilidade. Inclua essa informação no formulário e nossa equipe retorna com as opções.",
  },
  {
    q: "Por que comprar da Meeky e não de uma marca maior?",
    a: "O Meeky F5 ANC Pro é o único headphone ANC nessa faixa de preço com LDAC + Anatel + 70h de bateria + garantia de 12 meses com suporte em português. Marcas maiores cobram entre R$450 e R$800 por especificações equivalentes.",
  },
  {
    q: "A Meeky atende revendedores?",
    a: "Para pedidos acima de 100 unidades com interesse em revenda, entre em contato pelo formulário indicando 'revenda' na finalidade. Nossa equipe avalia caso a caso.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Compra Corporativa B2B de Headphones ANC",
  name: "Meeky para Empresas — Headphone ANC Corporativo",
  description:
    "Compra corporativa de headphones Meeky F5 ANC Pro a partir de 20 unidades com nota fiscal, garantia de 12 meses e suporte B2B no Brasil.",
  provider: {
    "@type": "Organization",
    name: "Meeky Audio",
    legalName: "Barganha Mix Ltda",
    taxID: "43.341.597/0001-40",
    url: "https://meeky.com.br",
  },
  areaServed: { "@type": "Country", name: "BR" },
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Empresas, RH, TI, Coworkings, Escolas de programação",
  },
  offers: {
    "@type": "Offer",
    eligibleQuantity: {
      "@type": "QuantitativeValue",
      minValue: 20,
      unitText: "unidades",
    },
    availability: "https://schema.org/InStock",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const B2BPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      empresa: "",
      cargo: "",
      email: "",
      whatsapp: "",
      quantidade: "",
      finalidade: "",
      prazo: "",
      personalizacao: "",
      mensagem: "",
    },
  });

  const onSubmit = (data: FormData) => {
    const msg = [
      `*Nova solicitação B2B — Meeky*`,
      `Nome: ${data.nome}`,
      `Empresa: ${data.empresa}`,
      `Cargo/Área: ${data.cargo}`,
      `E-mail: ${data.email}`,
      `WhatsApp: ${data.whatsapp}`,
      `Quantidade: ${data.quantidade}`,
      `Finalidade: ${data.finalidade}`,
      `Prazo: ${data.prazo}`,
      data.personalizacao ? `Personalização: ${data.personalizacao}` : null,
      data.mensagem ? `Mensagem: ${data.mensagem}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <Layout>
      <SEO
        title="Meeky para Empresas — Headphone ANC Corporativo a partir de 20 unidades"
        description="Compra corporativa de headphones ANC com nota fiscal, garantia de 12 meses e suporte no Brasil. A partir de 20 unidades para equipes, onboarding e presentes corporativos."
        canonical="https://meeky.com.br/empresas"
      />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* BLOCO 1 — Hero */}
      <section className="bg-primary" aria-labelledby="hero-title">
        <div className="container-wide section-padding py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-6 block">
                Meeky para Empresas
              </span>
              <h1
                id="hero-title"
                className="font-display text-3xl md:text-5xl lg:text-[3.25rem] font-bold text-primary-foreground tracking-tight leading-[1.1] mb-6"
              >
                Silencie as distrações. Amplifique o resultado. Meeky F5 ANC Pro para empresas,
                coworkings e onboarding
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/70 leading-relaxed max-w-2xl mb-10">
                O Meeky F5 ANC Pro é comprado por equipes de tecnologia, RH corporativo, coworkings
                e escolas de programação. Cancelamento de ruído ativo, 70 horas de bateria, LDAC,
                certificação Anatel e garantia de 12 meses no Brasil. Pedido mínimo de 20 unidades
                com nota fiscal e atendimento B2B direto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#formulario-b2b"
                  className="inline-block bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all hover:scale-105 text-center"
                >
                  SOLICITAR PROPOSTA PARA MINHA EMPRESA
                </a>
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent("Quero falar com o comercial B2B da Meeky.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-primary-foreground/30 text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-primary-foreground/10 transition-all text-center"
                >
                  FALAR COM O COMERCIAL NO WHATSAPP
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={urbanImg}
                alt="Profissional usando fone Meeky F5 ANC Pro em ambiente corporativo"
                width={600}
                height={800}
                loading="eager"
                fetchPriority="high"
                className="w-full max-w-md rounded-sm object-cover aspect-[3/4]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 2 — Para quem é */}
      <section className="bg-background" aria-labelledby="para-quem">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Para quem é" title="Empresas que já compram Meeky." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audienceCards.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="bg-secondary p-8 rounded-sm border border-border"
              >
                <item.icon size={28} className="text-accent mb-4" />
                <h3 className="font-display text-base font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 3 — Por que empresas escolhem */}
      <section className="bg-secondary" aria-labelledby="por-que-escolhem">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading
            eyebrow="Diferenciais"
            title="Por que empresas escolhem o Meeky F5 ANC Pro."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyItems.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="bg-background p-8 rounded-sm border border-border"
              >
                <item.icon size={28} className="text-accent mb-4" />
                <h3 className="font-display text-base font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 4 — Como funciona */}
      <section className="bg-background" aria-labelledby="como-funciona">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading
            eyebrow="Processo"
            title="Compra corporativa simples. Do formulário ao envio."
          />
          <div className="max-w-3xl mx-auto space-y-4 mb-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-4 bg-secondary p-5 rounded-sm border border-border"
              >
                <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 font-display font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-sm md:text-base text-foreground leading-relaxed pt-1">{step}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="#formulario-b2b"
              className="inline-block bg-primary text-primary-foreground px-10 py-4 text-sm font-semibold tracking-wider rounded-sm hover:opacity-90 transition-all"
            >
              SOLICITAR PROPOSTA PARA MINHA EMPRESA
            </a>
          </div>
        </div>
      </section>

      {/* BLOCO 5 — Condições por volume */}
      <section className="bg-secondary" aria-labelledby="volume">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">
              Volume
            </span>
            <h2
              id="volume"
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Condições melhores para pedidos maiores
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Compra corporativa a partir de 20 unidades, com proposta ajustada por volume, prazo,
              personalização e forma de pagamento. Não trabalhamos com tabela de preço engessada
              porque cada compra corporativa muda conforme quantidade, prazo e finalidade. Envie sua
              estimativa e retornamos com a melhor condição para sua empresa.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="hidden md:block rounded-sm border border-border overflow-hidden">
              <table className="w-full bg-background">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left p-5 font-display text-xs font-semibold tracking-wider uppercase w-1/3">
                      Faixa
                    </th>
                    <th className="text-left p-5 font-display text-xs font-semibold tracking-wider uppercase">
                      Benefícios
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {volumeTiers.map((tier, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-5 font-display font-semibold text-foreground">{tier.range}</td>
                      <td className="p-5 text-sm text-muted-foreground leading-relaxed">
                        {tier.benefits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {volumeTiers.map((tier, i) => (
                <div key={i} className="bg-background p-5 rounded-sm border border-border">
                  <p className="font-display font-semibold text-foreground mb-2">{tier.range}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tier.benefits}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
              Pedido mínimo: 20 unidades. Atendimento B2B com emissão de nota fiscal pela Barganha
              Mix Ltda — CNPJ 43.341.597/0001-40.
            </p>

            <div className="text-center mt-8">
              <a
                href="#formulario-b2b"
                className="inline-block bg-accent text-accent-foreground px-10 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all hover:scale-105"
              >
                SOLICITAR CONDIÇÃO POR VOLUME
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 6 — Por que confiar */}
      <section className="bg-background" aria-labelledby="confianca">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Confiança" title="Por que empresas confiam na Meeky" />
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="bg-secondary p-6 rounded-sm border border-border"
              >
                <CheckCircle2 size={22} className="text-accent mb-3" />
                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* BLOCO 6.5 — Amostra para teste */}
      <section className="bg-background" aria-labelledby="amostra-teste">
        <div className="container-wide section-padding py-16 md:py-24">
          <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-sm border border-border p-8 md:p-12 relative overflow-hidden">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4">
                  <Gift size={14} /> Amostra para teste
                </span>
                <h2
                  id="amostra-teste"
                  className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-4"
                >
                  Quer testar o Meeky F5 ANC Pro antes de fechar em volume?
                </h2>
                <p className="text-sm md:text-base text-primary-foreground/70 leading-relaxed mb-2">
                  Empresas avaliando compra corporativa podem solicitar condições especiais de
                  amostra para teste interno — para RH, TI ou o time que vai efetivamente usar o
                  produto validar conforto, ANC, bateria e integração com o setup atual.
                </p>
                <p className="text-xs text-primary-foreground/50 leading-relaxed">
                  Condições avaliadas caso a caso mediante contato com nosso time comercial.
                </p>
              </div>
              <div className="flex md:flex-col gap-3 md:min-w-[220px]">
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Tenho interesse em avaliar uma amostra do Meeky F5 ANC Pro para teste interno na minha empresa antes de fechar em volume.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all hover:scale-105 text-center"
                >
                  <Send size={16} /> FALAR NO WHATSAPP
                </a>
                <a
                  href="#formulario-b2b"
                  className="flex-1 inline-flex items-center justify-center border border-primary-foreground/30 text-primary-foreground px-6 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-primary-foreground/10 transition-all text-center"
                >
                  PELO FORMULÁRIO
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 7 — FAQ */}
      <section className="bg-secondary" aria-labelledby="faq-b2b">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading
            eyebrow="FAQ"
            title="Perguntas de compradores corporativos — respondidas"
          />
          <div className="max-w-3xl mx-auto">
            <ProductFAQ items={faqItems} />
          </div>
        </div>
      </section>

      {/* BLOCO 8 — Formulário */}
      <section
        id="formulario-b2b"
        className="bg-background scroll-mt-24"
        aria-labelledby="form-title"
      >
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">
                Proposta corporativa
              </span>
              <h2
                id="form-title"
                className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
              >
                Solicitar proposta para minha empresa
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Preencha abaixo. Nossa equipe comercial retorna com proposta personalizada em até 24
                horas úteis. Para pedidos acima de 100 unidades, um consultor B2B entra em contato
                com condição especial.
              </p>
            </div>

            {submitted && (
              <div className="bg-accent/10 border border-accent rounded-sm p-5 mb-8 flex items-start gap-3">
                <CheckCircle2 size={22} className="text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  Recebemos sua solicitação. Nossa equipe comercial vai analisar quantidade, prazo e
                  finalidade para enviar a melhor condição para sua empresa em até 24 horas úteis.
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Nome completo *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Empresa *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Cargo / Área *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["RH", "Compras", "TI", "Operações", "Marketing", "Founder", "Educação", "Outro"].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        E-mail corporativo *
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        WhatsApp com DDD *
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Quantidade estimada *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a faixa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["20–49", "50–99", "100–199", "200–499", "500+"].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt} unidades
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Finalidade da compra *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "Onboarding",
                            "Equipe interna",
                            "Evento",
                            "Presente corporativo",
                            "Coworking",
                            "Escola de programação",
                            "Revenda",
                            "Outro",
                          ].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Prazo desejado *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "Urgente (até 7 dias)",
                            "7–15 dias",
                            "15–30 dias",
                            "Sem data definida",
                          ].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Precisa de personalização?
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Opcional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Sim", "Não", "Talvez"].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mensagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                        Mensagem adicional
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Conte mais sobre o seu projeto (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  SOLICITAR PROPOSTA CORPORATIVA <Send size={16} />
                </button>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Os dados enviados neste formulário são usados apenas pela nossa equipe comercial
                  para preparar e enviar a proposta corporativa solicitada. Consulte a{" "}
                  <a href="/privacidade" className="underline hover:text-accent">Política de Privacidade</a>.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default B2BPage;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Quais os tipos de produtos vocês vendem?",
    answer: "Todos os tipos de cosméticos, produtos para cabelos e para beleza em geral. Trabalhamos com as melhores marcas nacionais e internacionais.",
  },
  {
    question: "Vocês oferecem algum tipo de desconto?",
    answer: "Você pode aproveitar descontos e ofertas exclusivas baixando o nosso app Clube Bela. Com o app, você também acumula cashback e pode resgatar prêmios!",
  },
  {
    question: "Onde encontro uma loja?",
    answer: "Possuímos mais de 30 lojas espalhadas pelo Rio de Janeiro. Você pode conferir o endereço de cada uma no nosso site ou pelo app.",
  },
  {
    question: "Quais os métodos de pagamento aceitos?",
    answer: "Aceitamos dinheiro, pix, cartões de débito e crédito. Oferecemos também parcelamento em até 12x em compras acima de determinado valor.",
  },
  {
    question: "Vocês fazem entregas?",
    answer: "Sim! Contamos com um sistema Delivery para entregar seu pedido no conforto da sua casa. O serviço está disponível para diversas regiões do Rio de Janeiro.",
  },
  {
    question: "O que é o Clube Bela?",
    answer: "Clube Bela é o nosso aplicativo exclusivo. Baixe o app e cadastre-se para condições exclusivas, como descontos, resgates de prêmios, cashback e outros benefícios para aproveitar em nossas lojas físicas.",
  },
];

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="section-padding bg-background">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mt-4">
            Perguntas Frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="font-medium text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

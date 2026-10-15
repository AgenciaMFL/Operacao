import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";

const TermosPage = () => {

  return (
    <Layout>
      <SEO title="Termos de Uso | Meeky Audio" description="Termos de uso e condições gerais de compra da Meeky Audio, operada pela Barganha Mix Ltda." />
      <section className="bg-background">
        <div className="container-wide section-padding py-12 md:py-20 max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6 [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

            <p>Última atualização: 31 de março de 2026</p>

            <h2>1. Identificação</h2>
            <p>Este site é de propriedade e operado pela <strong>Barganha Mix Ltda</strong>, inscrita no CNPJ sob o nº <strong>43.341.597/0001-40</strong>, com comunicação através dos canais oficiais: contato@meeky.com.br e telefone (12) 99107-4311.</p>

            <h2>2. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar o site meeky.com.br, você concorda integralmente com estes Termos de Uso. Caso não concorde, solicitamos que não utilize nossos serviços.</p>

            <h2>3. Produtos e Preços</h2>
            <p>Os preços exibidos no site estão em Reais (BRL) e podem ser alterados sem aviso prévio. Promoções e cupons de desconto possuem validade limitada e condições específicas informadas no momento da oferta.</p>

            <h2>4. Processo de Compra</h2>
            <p>Para realizar uma compra, o cliente deverá fornecer dados pessoais completos, incluindo <strong>CPF ou CNPJ</strong>, necessário para emissão da Nota Fiscal Eletrônica (NF-e) conforme exigência fiscal brasileira. O pagamento é processado de forma segura via <strong>Mercado Pago</strong>.</p>

            <h2>5. Entrega</h2>
            <p>Os produtos são enviados para todo o Brasil. O prazo de postagem é de até <strong>24 horas úteis</strong> após a confirmação do pagamento. O <strong>frete é grátis</strong> para todos os pedidos. O rastreio completo é enviado por e-mail após a postagem.</p>

            <h2>6. Direito de Arrependimento</h2>
            <p>Conforme o <strong>Art. 49 do Código de Defesa do Consumidor</strong>, o cliente tem o direito de desistir da compra no prazo de <strong>7 (sete) dias corridos</strong> a partir do recebimento do produto, sem necessidade de justificativa. Para exercer este direito, entre em contato pelo e-mail suporte@meeky.com.br.</p>

            <h2>7. Garantia</h2>
            <p>Todos os produtos Meeky possuem garantia contra defeitos de fabricação conforme previsto no Código de Defesa do Consumidor. Caso identifique algum defeito, entre em contato com nosso suporte.</p>

            <h2>8. Propriedade Intelectual</h2>
            <p>Todo o conteúdo deste site (textos, imagens, logotipos e design) é de propriedade exclusiva da Barganha Mix Ltda e está protegido pela legislação de direitos autorais.</p>

            <h2>9. Alterações</h2>
            <p>A Barganha Mix Ltda se reserva o direito de alterar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após sua publicação no site.</p>

            <h2>10. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>E-mail: contato@meeky.com.br</li>
              <li>WhatsApp: (12) 99107-4311</li>
              <li>Instagram: @meeky.br</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermosPage;

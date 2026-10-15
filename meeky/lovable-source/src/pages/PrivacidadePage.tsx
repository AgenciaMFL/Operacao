import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";

const PrivacidadePage = () => {

  return (
    <Layout>
      <SEO title="Política de Privacidade | Meeky Audio" description="Política de privacidade e proteção de dados da Meeky Audio, conforme a LGPD." />
      <section className="bg-background">
        <div className="container-wide section-padding py-12 md:py-20 max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6 [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

            <p>Última atualização: 31 de março de 2026</p>

            <h2>1. Controlador dos Dados</h2>
            <p>A <strong>Barganha Mix Ltda</strong> (CNPJ: 43.341.597/0001-40) é a controladora dos dados pessoais coletados neste site, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).</p>

            <h2>2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados pessoais durante o processo de compra:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nome completo</strong> — identificação do comprador</li>
              <li><strong>E-mail</strong> — comunicação sobre o pedido e envio de rastreio</li>
              <li><strong>WhatsApp/Telefone</strong> — suporte ao cliente</li>
              <li><strong>CPF ou CNPJ</strong> — obrigatório para emissão da Nota Fiscal Eletrônica (NF-e), conforme exigência da legislação fiscal brasileira</li>
              <li><strong>Endereço completo</strong> — entrega do produto</li>
            </ul>

            <h2>3. Finalidade do Tratamento</h2>
            <p>Os dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Processamento e envio do pedido</li>
              <li>Emissão de Nota Fiscal Eletrônica</li>
              <li>Comunicação sobre status do pedido e rastreio</li>
              <li>Suporte pós-venda</li>
              <li>Cumprimento de obrigações legais e fiscais</li>
            </ul>

            <h2>4. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados com os seguintes operadores e parceiros, sempre limitados à finalidade descrita:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Processamento de pagamento:</strong> Mercado Pago</li>
              <li><strong>Gestão de pedidos e estoque:</strong> Tiny ERP (emissão de NF-e, controle de estoque)</li>
              <li><strong>Envio (cálculo de frete e emissão de etiqueta):</strong> Melhor Envio e transportadoras parceiras (Correios e transportadoras contratadas). Compartilhamos nome, endereço completo e CPF para geração de etiqueta e rastreio</li>
              <li><strong>Consulta de CEP:</strong> ViaCEP (apenas o CEP digitado é enviado; nenhum dado pessoal é compartilhado)</li>
              <li><strong>Comunicação transacional:</strong> Resend (envio de e-mails de confirmação de pedido, rastreio, recuperação de carrinho, recuperação de senha e atualizações de status — inclui nome, e-mail e dados do pedido)</li>
              <li><strong>Métricas e publicidade:</strong> Google Analytics 4, Google Tag Manager, Google Ads/Merchant Center, Google Merchant Widget (vitrine de produtos), Meta Pixel (Facebook/Instagram) e TikTok Pixel. Dados de navegação (páginas visitadas, dispositivo, origem do tráfego, interações e, quando aplicável, identificadores de campanha) são compartilhados com Google, Meta e TikTok para fins de análise de audiência, mensuração de campanhas e publicidade direcionada. No caso do TikTok Pixel, dados como e-mail ou telefone podem ser compartilhados de forma criptografada (hash) para fins de correspondência de audiência (audience matching) — <strong>somente após o seu consentimento</strong> por meio do banner de cookies</li>
              <li><strong>Monitoramento técnico:</strong> Sentry (rastreamento de erros e desempenho da aplicação, podendo conter URL da requisição e metadados técnicos; dados sensíveis são mascarados)</li>
              <li><strong>Infraestrutura:</strong> Lovable Cloud / Supabase (operador responsável por banco de dados, autenticação e hospedagem de funções)</li>
            </ul>
            <p>Dados de navegação são compartilhados com Google, Meta e TikTok para fins de análise de audiência, mensuração e publicidade direcionada, exclusivamente após o seu consentimento coletado via banner de cookies — que pode ser revogado a qualquer momento em "Preferências de cookies" no rodapé do site. <strong>Não vendemos nem alugamos seus dados cadastrais/pessoais a terceiros.</strong></p>

            <h2>5. Segurança dos Dados</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados pessoais, incluindo criptografia SSL/TLS, armazenamento seguro e controle de acesso restrito.</p>

            <h2>6. Retenção dos Dados</h2>
            <p>Os dados são mantidos pelo período necessário para cumprir as finalidades descritas e as obrigações legais aplicáveis (mínimo de 5 anos para dados fiscais, conforme legislação brasileira).</p>

            <h2>7. Seus Direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Confirmar a existência do tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Solicitar correção de dados incompletos ou desatualizados</li>
              <li>Solicitar a eliminação dos dados (quando aplicável)</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p>Para exercer seus direitos, entre em contato pelo e-mail <strong>suporte@meeky.com.br</strong>.</p>

            <h2>8. Cookies e Ferramentas de Análise</h2>
            <p>Utilizamos cookies essenciais para o funcionamento do site (navegação, carrinho, checkout e sessão) e, mediante seu consentimento, cookies analíticos e de publicidade.</p>
            <p><strong>Banner de consentimento:</strong> ao acessar o site pela primeira vez, exibimos um banner que permite <strong>Aceitar todos</strong>, <strong>Rejeitar não essenciais</strong> ou <strong>Personalizar</strong> por categoria (Necessários, Analytics e Publicidade). Enquanto você não decidir — ou se rejeitar — nenhuma tag de terceiro (GA4, GTM, Meta Pixel, TikTok Pixel) é carregada. Utilizamos o <strong>Google Consent Mode v2</strong> para garantir que Google Analytics e Google Ads respeitem sua escolha desde o primeiro carregamento da página.</p>
            <p><strong>Categorias:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Necessários:</strong> essenciais para o site funcionar (sessão, carrinho, checkout). Sempre ativos.</li>
              <li><strong>Analytics:</strong> Google Analytics 4 e Google Tag Manager, para mensurar tráfego e desempenho de forma agregada.</li>
              <li><strong>Publicidade:</strong> Meta Pixel (Facebook/Instagram), TikTok Pixel e recursos de remarketing do Google, para mensuração de campanhas e publicidade direcionada.</li>
            </ul>
            <p><strong>Como alterar sua escolha:</strong> a qualquer momento, clique em <strong>"Preferências de cookies"</strong> no rodapé do site para revogar ou ajustar seu consentimento. Você também pode desativar cookies diretamente no seu navegador, usar o modo anônimo, ou instalar o complemento oficial de opt-out do Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">tools.google.com/dlpage/gaoptout</a>.</p>

            <h2>9. Alterações</h2>
            <p>Esta política pode ser atualizada periodicamente. Recomendamos a revisão regular desta página.</p>

            <h2>10. Contato</h2>
            <p>Para dúvidas sobre privacidade e proteção de dados:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>E-mail: suporte@meeky.com.br</li>
              <li>WhatsApp: (12) 99107-4311</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacidadePage;

import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";

const ExclusaoDadosPage = () => {
  return (
    <Layout>
      <SEO
        title="Exclusão, Acesso e Portabilidade de Dados | Meeky Audio"
        description="Como solicitar exclusão, acesso ou uma cópia (portabilidade) dos seus dados pessoais na Meeky Audio, prazo de resposta e o que é retido por obrigação legal (LGPD)."
        canonical="https://meeky.com.br/exclusao-de-dados"
      />
      <section className="bg-background">
        <div className="container-wide section-padding py-12 md:py-20 max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Exclusão, Acesso e Portabilidade de Dados
          </h1>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6 [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

            <p>Última atualização: 15 de julho de 2026</p>

            <p>
              Esta página descreve como você pode solicitar a <strong>exclusão</strong>, o{" "}
              <strong>acesso</strong> ou uma <strong>cópia (portabilidade)</strong> dos seus dados
              pessoais mantidos pela <strong>Barganha Mix Ltda</strong> (CNPJ: 43.341.597/0001-40),
              operadora da marca <strong>Meeky Audio</strong>, em conformidade com o Art. 18 da Lei
              Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>

            <h2>1. Como solicitar a exclusão</h2>
            <p>Envie um e-mail para <strong>suporte@meeky.com.br</strong> com:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Assunto:</strong> "Solicitação de Exclusão de Dados"</li>
              <li><strong>Nome completo</strong> cadastrado</li>
              <li><strong>E-mail</strong> usado no cadastro/compra</li>
              <li><strong>CPF ou CNPJ</strong> (para verificação de identidade)</li>
              <li><strong>Descrição</strong> — se quer excluir todos os dados possíveis ou apenas dados específicos (ex: sair da lista de e-mails de marketing, remover do funil de leads, etc.)</li>
            </ul>
            <p>
              Como alternativa, você também pode nos contatar pelo WhatsApp <strong>(12) 99107-4311</strong>.
            </p>

            <h2>2. Prazo de resposta</h2>
            <p>
              Responderemos sua solicitação em até <strong>15 (quinze) dias úteis</strong> a partir do recebimento, conforme prazo razoável previsto pela LGPD. Você receberá uma confirmação por e-mail assim que a exclusão for concluída.
            </p>

            <h2>3. O que é excluído</h2>
            <p>Mediante solicitação, excluímos permanentemente:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cadastro na lista de e-mails de marketing e newsletters</li>
              <li>Leads capturados por formulários (Lista VIP, contato B2B, exit-intent, cupons)</li>
              <li>Checkouts abandonados (nome, e-mail, telefone salvos antes da finalização da compra)</li>
              <li>Sessões de navegação e eventos de tracking associados ao seu cadastro</li>
              <li>Preferências, cupons pessoais e histórico de campanhas</li>
              <li>Registros de suporte e conversas por e-mail (após conclusão do atendimento)</li>
            </ul>

            <h2>4. O que é retido por obrigação legal</h2>
            <p>
              Alguns dados <strong>não podem ser excluídos</strong> a pedido, pois estamos obrigados por lei a mantê-los por prazos específicos:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Dados fiscais de pedidos concluídos</strong> (nome, CPF/CNPJ, endereço, itens, valor pago, Nota Fiscal Eletrônica) — retidos por <strong>no mínimo 5 anos</strong>, conforme Art. 173 do Código Tributário Nacional e legislação fiscal aplicável.
              </li>
              <li>
                <strong>Registros de acesso e transação</strong> associados a pagamentos — retidos pelo prazo exigido por regulamentações antifraude e pelo Marco Civil da Internet (Lei nº 12.965/2014, Art. 15 — mínimo 6 meses).
              </li>
            </ul>
            <p>
              Após o cumprimento desses prazos legais, os dados retidos são eliminados de forma segura.
            </p>

            <h2>5. Acesso e portabilidade dos seus dados</h2>
            <p>
              Além da exclusão, você tem direito a <strong>solicitar acesso</strong> aos dados
              pessoais que mantemos sobre você e a <strong>receber uma cópia</strong> dessas
              informações em formato legível (portabilidade), conforme o Art. 18, incisos II e V,
              da LGPD.
            </p>
            <p>
              O processo é o mesmo da exclusão: envie um e-mail para{" "}
              <strong>suporte@meeky.com.br</strong> com o assunto{" "}
              <strong>"Solicitação de Acesso aos Dados"</strong> ou{" "}
              <strong>"Solicitação de Portabilidade de Dados"</strong>, informando nome completo,
              e-mail cadastrado e CPF/CNPJ para verificação de identidade. Respondemos em até{" "}
              <strong>15 (quinze) dias úteis</strong>, enviando as informações que temos sobre
              você em formato eletrônico estruturado (por exemplo, JSON ou CSV) por e-mail.
            </p>
            <p>
              Você também pode solicitar apenas a <strong>correção</strong> de dados incompletos,
              inexatos ou desatualizados usando o mesmo canal.
            </p>

            <h2>6. Exclusão via login com redes sociais (Meta / Facebook / Instagram)</h2>
            <p>
              Atualmente a Meeky Audio <strong>não utiliza login social</strong> (Facebook Login, Google Sign-In, etc.) no site ou em aplicativos. Se, no futuro, integrarmos algum login social, esta página será atualizada com instruções específicas para cada provedor.
            </p>

            <h2>7. Seus outros direitos LGPD</h2>
            <p>
              Além da exclusão, acesso e portabilidade, você tem direito a corrigir seus dados,
              revogar consentimentos e obter informações sobre com quem os dados são compartilhados
              a qualquer momento. Detalhes na nossa{" "}
              <Link to="/privacidade" className="underline text-foreground hover:text-accent">
                Política de Privacidade
              </Link>
              .
            </p>

            <h2>8. Contato do Encarregado de Dados</h2>
            <p>Para qualquer questão relacionada à proteção dos seus dados:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>E-mail: <strong>suporte@meeky.com.br</strong></li>
              <li>WhatsApp: (12) 99107-4311</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExclusaoDadosPage;

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Meeky"

interface OrderConfirmationProps {
  customerName?: string
  paymentId?: string
  productName?: string
  productPrice?: string
  shippingCost?: string
  totalAmount?: string
  couponCode?: string
}

const OrderConfirmationEmail = ({
  customerName,
  paymentId,
  productName = 'Headphone Meeky F5 ANC Pro',
  productPrice = 'R$ 297,00',
  shippingCost = 'Grátis',
  totalAmount,
  couponCode,
}: OrderConfirmationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu pedido Meeky foi confirmado! 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {customerName ? `Olá, ${customerName}!` : 'Olá!'}
        </Heading>
        <Text style={textHighlight}>
          ✅ Seu pagamento foi aprovado com sucesso!
        </Text>

        <Section style={orderBox}>
          <Text style={orderTitle}>Resumo do Pedido</Text>
          <Text style={orderDetail}>📦 Produto: {productName}</Text>
          <Text style={orderDetail}>💰 Valor: {productPrice}</Text>
          <Text style={orderDetail}>🚚 Frete (Envio Full SP): Grátis</Text>
          {couponCode && <Text style={orderDetail}>🏷️ Cupom: {couponCode}</Text>}
          <Hr style={divider} />
          <Text style={orderTotal}>Total: {totalAmount || productPrice}</Text>
          {paymentId && <Text style={orderRef}>Ref. Pagamento: #{paymentId}</Text>}
        </Section>

        <Section style={infoSection}>
          <Text style={infoTitle}>📬 Envio Full — Postagem em até 24h úteis</Text>
          <Text style={text}>
            Seu pedido será postado em até 24 horas úteis. Você receberá o código de rastreio assim que disponível.
          </Text>
        </Section>

        <Section style={infoSection}>
          <Text style={infoTitle}>🛡️ Garantia de 1 Ano no Brasil</Text>
          <Text style={text}>
            Seu Meeky F5 ANC Pro possui garantia de 1 ano. Em caso de qualquer problema, estamos aqui para ajudar.
          </Text>
        </Section>

        <Section style={ctaSection}>
          <Text style={text}>
            Precisa de ajuda? Fale com nosso suporte:
          </Text>
          <Button style={button} href="https://wa.me/5512991074311?text=Olá! Preciso de ajuda com meu pedido Meeky">
            💬 Falar no WhatsApp
          </Button>
        </Section>

        <Hr style={divider} />
        <Text style={footerLinks}>
          <a href="https://meeky.com.br/faq" style={footerLink}>FAQ</a>
          {' • '}
          <a href="https://meeky.com.br/politica-de-devolucao" style={footerLink}>Política de Devolução</a>
          {' • '}
          <a href="https://meeky.com.br/faq" style={footerLink}>Como usar seu Meeky</a>
        </Text>
        <Text style={footer}>
          {SITE_NAME}® — Tecnologia e Áudio para Máxima Produtividade
        </Text>
        <Text style={footerSmall}>
          Barganha Mix LTDA • contato@meeky.com.br
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: 'Seu Meeky F5 ANC Pro está a caminho! 🚀',
  displayName: 'Confirmação de pedido',
  previewData: {
    customerName: 'Maria',
    paymentId: '12345678',
    productName: 'Headphone Meeky F5 ANC Pro',
    productPrice: 'R$ 297,00',
    shippingCost: 'Grátis',
    totalAmount: 'R$ 297,00',
  },
} satisfies TemplateEntry

// Styles — Meeky brand: dark primary, gold accent (hsl 39 44% 58%)
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#141414', margin: '0 0 16px' }
const textHighlight = { fontSize: '16px', color: '#16a34a', fontWeight: '600' as const, margin: '0 0 24px' }
const text = { fontSize: '14px', color: '#666666', lineHeight: '1.6', margin: '0 0 12px' }
const orderBox = { backgroundColor: '#faf8f5', borderRadius: '8px', padding: '20px', margin: '0 0 24px', border: '1px solid #e8e4de' }
const orderTitle = { fontSize: '16px', fontWeight: '600' as const, color: '#141414', margin: '0 0 12px' }
const orderDetail = { fontSize: '14px', color: '#555555', margin: '0 0 6px' }
const orderTotal = { fontSize: '18px', fontWeight: '700' as const, color: '#141414', margin: '0 0 4px' }
const orderRef = { fontSize: '12px', color: '#999999', margin: '0' }
const divider = { borderColor: '#e8e4de', margin: '20px 0' }
const infoSection = { margin: '0 0 20px' }
const infoTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#141414', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const button = {
  backgroundColor: '#141414',
  color: '#faf8f5',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
}
const footer = { fontSize: '13px', color: '#999999', textAlign: 'center' as const, margin: '0 0 4px' }
const footerLinks = { fontSize: '12px', color: '#666666', textAlign: 'center' as const, margin: '0 0 12px' }
const footerLink = { color: '#141414', textDecoration: 'underline' }
const footerSmall = { fontSize: '11px', color: '#bbbbbb', textAlign: 'center' as const, margin: '0' }

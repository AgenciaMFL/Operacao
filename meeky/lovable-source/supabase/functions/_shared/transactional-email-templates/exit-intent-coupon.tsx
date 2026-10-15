import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Meeky"

interface ExitIntentCouponProps {
  couponCode?: string
}

const ExitIntentCouponEmail = ({ couponCode = 'SAIR5-XXXX' }: ExitIntentCouponProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu cupom Meeky chegou — 5% off por 24h ⏰</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Aqui está seu desconto exclusivo</Heading>
        <Text style={text}>
          Obrigado pelo seu interesse no Meeky F5 ANC Pro. Separamos um cupom exclusivo de 5% off para você finalizar sua compra agora.
        </Text>

        <Section style={couponBox}>
          <Text style={couponLabel}>SEU CUPOM</Text>
          <Text style={couponCodeStyle}>{couponCode}</Text>
          <Text style={couponDiscount}>5% OFF</Text>
        </Section>

        <Text style={textCenter}>
          Use no checkout em <strong>meeky.com.br</strong> — válido por 24 horas a partir de agora.
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href="https://meeky.com.br/checkout">
            USAR MEU CUPOM AGORA
          </Button>
        </Section>

        <Section style={urgencyBox}>
          <Text style={urgencyText}>⏰ Este cupom expira em 24h</Text>
        </Section>

        <Hr style={divider} />
        <Text style={footerLinks}>
          <a href="https://meeky.com.br/faq" style={footerLink}>FAQ</a>
          {' • '}
          <a href="https://meeky.com.br/politica-de-devolucao" style={footerLink}>Política de Devolução</a>
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
  component: ExitIntentCouponEmail,
  subject: 'Seu cupom Meeky chegou — 5% off por 24h ⏰',
  displayName: 'Cupom exit intent',
  previewData: { couponCode: 'SAIR5-AB3D' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#141414', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#666666', lineHeight: '1.6', margin: '0 0 20px' }
const textCenter = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '20px 0', textAlign: 'center' as const }
const couponBox = {
  backgroundColor: '#141414',
  borderRadius: '12px',
  padding: '28px 20px',
  margin: '24px 0',
  textAlign: 'center' as const,
  border: '2px dashed #c9a352',
}
const couponLabel = { fontSize: '12px', color: '#c9a352', letterSpacing: '2px', fontWeight: '600' as const, margin: '0 0 8px' }
const couponCodeStyle = { fontSize: '32px', color: '#faf8f5', fontWeight: '700' as const, letterSpacing: '3px', margin: '0 0 8px', fontFamily: 'monospace' }
const couponDiscount = { fontSize: '14px', color: '#c9a352', fontWeight: '600' as const, margin: '0' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const button = {
  backgroundColor: '#141414',
  color: '#faf8f5',
  padding: '14px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '700' as const,
  textDecoration: 'none',
  letterSpacing: '1px',
}
const urgencyBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '12px',
  margin: '20px 0',
  textAlign: 'center' as const,
}
const urgencyText = { fontSize: '14px', color: '#c2410c', fontWeight: '600' as const, margin: '0' }
const divider = { borderColor: '#e8e4de', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#999999', textAlign: 'center' as const, margin: '0 0 4px' }
const footerLinks = { fontSize: '12px', color: '#666666', textAlign: 'center' as const, margin: '0 0 12px' }
const footerLink = { color: '#141414', textDecoration: 'underline' }
const footerSmall = { fontSize: '11px', color: '#bbbbbb', textAlign: 'center' as const, margin: '0' }

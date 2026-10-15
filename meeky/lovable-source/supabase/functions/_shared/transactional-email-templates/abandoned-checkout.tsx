import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Meeky"

interface AbandonedCheckoutProps {
  name?: string
  resumeUrl?: string
}

const AbandonedCheckoutEmail = ({
  name,
  resumeUrl = 'https://meeky.com.br/checkout',
}: AbandonedCheckoutProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você deixou um Meeky F5 ANC Pro no carrinho</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Ainda dá tempo de finalizar</Heading>
        <Text style={text}>
          {name ? `Olá, ${name.split(' ')[0]}.` : 'Olá.'} Você começou a compra do
          <strong> Headphone Meeky F5 ANC Pro</strong> mas não concluiu o pagamento.
        </Text>
        <Text style={text}>
          Se quiser, é só continuar de onde parou — seus dados ainda estão lá.
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href={resumeUrl}>
            RETOMAR MINHA COMPRA
          </Button>
        </Section>

        <Text style={textSmall}>
          Se a página não abrir com seus dados preenchidos, você ainda pode
          finalizar diretamente em <a href="https://meeky.com.br/checkout" style={footerLink}>meeky.com.br/checkout</a>.
        </Text>

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
  component: AbandonedCheckoutEmail,
  subject: 'Você deixou um Meeky F5 ANC Pro no carrinho',
  displayName: 'Recuperação de carrinho abandonado',
  previewData: { name: 'Maria', resumeUrl: 'https://meeky.com.br/checkout?resume=abc' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#141414', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '13px', color: '#777777', lineHeight: '1.6', margin: '16px 0 0' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0 12px' }
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
const divider = { borderColor: '#e8e4de', margin: '28px 0 20px' }
const footer = { fontSize: '13px', color: '#999999', textAlign: 'center' as const, margin: '0 0 4px' }
const footerLinks = { fontSize: '12px', color: '#666666', textAlign: 'center' as const, margin: '0 0 12px' }
const footerLink = { color: '#141414', textDecoration: 'underline' }
const footerSmall = { fontSize: '11px', color: '#bbbbbb', textAlign: 'center' as const, margin: '0' }

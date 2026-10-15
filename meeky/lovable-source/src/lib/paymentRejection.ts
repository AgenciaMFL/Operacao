// Classificação de motivos de recusa do Mercado Pago.
//
// Por que existe: ~75% das recusas de cartão são `cc_rejected_high_risk` —
// bloqueio preventivo do antifraude do MP, não problema do cartão do cliente.
// Nesse caso o cliente quase sempre consegue pagar via Pix na hora, então
// precisamos reagir de forma diferente da recusa comum (saldo/CVV/validade).
//
// Nunca expor `status_detail` bruto ao cliente — é informação técnica interna.

/** Bloqueios preventivos de risco/antifraude (cliente e cartão estão OK). */
const ANTIFRAUD_DETAILS: ReadonlySet<string> = new Set([
  "cc_rejected_high_risk",
  "rejected_high_risk",
  "cc_rejected_blacklist",
  "rejected_by_bank",
  "cc_rejected_by_bank",
]);

/** Recusas comuns — problema real do meio de pagamento. Mensagem genérica. */
const COMMON_DETAILS: ReadonlySet<string> = new Set([
  "cc_rejected_insufficient_amount",
  "cc_rejected_bad_filled_security_code",
  "cc_rejected_bad_filled_date",
  "cc_rejected_bad_filled_card_number",
  "cc_rejected_bad_filled_other",
  "cc_rejected_call_for_authorize",
  "cc_rejected_card_disabled",
  "cc_rejected_duplicated_payment",
  "cc_rejected_invalid_installments",
  "cc_rejected_max_attempts",
  "cc_rejected_card_error",
]);

export function isAntifraudRejection(statusDetail?: string | null): boolean {
  if (!statusDetail) return false;
  const d = statusDetail.toString().trim().toLowerCase();
  if (COMMON_DETAILS.has(d)) return false;
  if (ANTIFRAUD_DETAILS.has(d)) return true;
  // Variantes futuras/desconhecidas de bloqueio de risco.
  return /high_risk|blacklist|fraud/.test(d);
}

export const ANTIFRAUD_MESSAGE =
  "Seu cartão foi temporariamente bloqueado pelo sistema de segurança do processador de pagamento — isso não tem relação com você nem com seu limite. Finalize via Pix, que costuma aprovar na hora.";

// Pure decision logic for the Mercado Pago webhook idempotency guard.
// Kept isolated (no I/O, no imports) so it can be unit-tested with `deno test`.
//
// Bug this file prevents from ever coming back:
// Marking `webhook_events.status = 'completed'` for intermediate MP states
// (in_process, pending, authorized) causes the idempotency guard to block the
// follow-up approval webhook. The order then stays stuck in "pending" forever
// even though the payment was actually approved. Only truly terminal states
// (approved + the failure family) should mark the event completed.

export type MpPaymentStatus =
  | "approved"
  | "in_process"
  | "pending"
  | "authorized"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  // Any other unknown/future MP status:
  | (string & Record<never, never>);

export type WebhookEventStatus = "completed" | "processing";

/** MP payment statuses that will NOT receive any further notification. */
const TERMINAL_FAILURE_STATES: ReadonlySet<string> = new Set([
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);

/** MP payment statuses that may transition to `approved` in a later webhook. */
const INTERMEDIATE_STATES: ReadonlySet<string> = new Set([
  "in_process",
  "pending",
  "authorized",
]);

export function isTerminalMpStatus(mpStatus: string): boolean {
  return mpStatus === "approved" || TERMINAL_FAILURE_STATES.has(mpStatus);
}

export function isIntermediateMpStatus(mpStatus: string): boolean {
  return INTERMEDIATE_STATES.has(mpStatus);
}

/**
 * Given the MP payment status of a non-approved notification, decide whether
 * the corresponding `webhook_events` row should be marked as `completed`
 * (no more retries expected) or left as `processing` (MP will send another
 * webhook when the payment settles).
 *
 * Callers pass any non-approved status; `approved` is handled on the main
 * success path and would also return `completed` here for completeness.
 */
export function decideWebhookEventStatus(mpStatus: string): WebhookEventStatus {
  if (mpStatus === "approved") return "completed";
  if (TERMINAL_FAILURE_STATES.has(mpStatus)) return "completed";
  // Intermediate states AND unknown/future states default to `processing`,
  // so a new MP status we haven't seen yet can't silently block retries.
  return "processing";
}

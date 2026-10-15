// Shared helper to record outgoing emails into public.email_send_log.
// Non-blocking: never throws to the caller; on failure logs to console only.

type SupabaseAdmin = ReturnType<typeof import("https://esm.sh/@supabase/supabase-js@2.49.1").createClient>;

export type EmailLogStatus = "pending" | "sent" | "failed" | "suppressed" | "bounced" | "complained" | "dlq";

export async function logEmailSend(
  supabaseAdmin: SupabaseAdmin,
  params: {
    messageId: string;
    templateName: string;
    recipientEmail: string;
    status: EmailLogStatus;
    errorMessage?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("email_send_log").insert({
      message_id: params.messageId,
      template_name: params.templateName,
      recipient_email: params.recipientEmail,
      status: params.status,
      error_message: params.errorMessage ?? null,
      metadata: params.metadata ?? null,
    });
    if (error) {
      // Unique index on (message_id) WHERE status='sent' — duplicates for the
      // same successful send are silently ignored (idempotent).
      if (!/duplicate|unique/i.test(error.message)) {
        console.warn("⚠️ email_send_log insert failed (non-blocking):", error.message);
      }
    }
  } catch (err) {
    console.warn("⚠️ email_send_log exception (non-blocking):", (err as Error).message);
  }
}

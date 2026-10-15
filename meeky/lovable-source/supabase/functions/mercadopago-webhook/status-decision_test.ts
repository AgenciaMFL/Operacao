import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  decideWebhookEventStatus,
  isIntermediateMpStatus,
  isTerminalMpStatus,
} from "./status-decision.ts";

// Regression coverage for the bug fixed on 2026-07: intermediate MP payment
// states were being marked webhook_events.status='completed', which blocked
// the follow-up approval webhook via the idempotency guard and left orders
// stuck in "pending" forever. If anyone reintroduces that bug, this suite
// fails immediately.

Deno.test("approved marks the webhook event as completed", () => {
  assertEquals(decideWebhookEventStatus("approved"), "completed");
});

Deno.test("terminal failure states mark the webhook event as completed", () => {
  for (const s of ["rejected", "cancelled", "refunded", "charged_back"]) {
    assertEquals(
      decideWebhookEventStatus(s),
      "completed",
      `${s} must be terminal`,
    );
  }
});

Deno.test("intermediate states must NOT be marked completed (regression)", () => {
  for (const s of ["in_process", "pending", "authorized"]) {
    assertEquals(
      decideWebhookEventStatus(s),
      "processing",
      `${s} is intermediate — marking it completed reintroduces the pending-order bug`,
    );
  }
});

Deno.test("unknown/future MP statuses default to processing (safe)", () => {
  // Fail-safe: an unknown status must never block a retry from a future MP webhook.
  assertEquals(decideWebhookEventStatus("some_future_state"), "processing");
  assertEquals(decideWebhookEventStatus(""), "processing");
});

Deno.test("isTerminalMpStatus / isIntermediateMpStatus classify every documented state", () => {
  const terminal = ["approved", "rejected", "cancelled", "refunded", "charged_back"];
  const intermediate = ["in_process", "pending", "authorized"];

  for (const s of terminal) {
    assertEquals(isTerminalMpStatus(s), true, `${s} should be terminal`);
    assertEquals(isIntermediateMpStatus(s), false, `${s} should not be intermediate`);
  }
  for (const s of intermediate) {
    assertEquals(isIntermediateMpStatus(s), true, `${s} should be intermediate`);
    assertEquals(isTerminalMpStatus(s), false, `${s} should not be terminal`);
  }
});

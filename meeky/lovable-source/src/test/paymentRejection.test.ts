import { describe, it, expect } from "vitest";
import { isAntifraudRejection } from "@/lib/paymentRejection";

describe("isAntifraudRejection", () => {
  it("detecta bloqueio de antifraude", () => {
    expect(isAntifraudRejection("cc_rejected_high_risk")).toBe(true);
    expect(isAntifraudRejection("CC_REJECTED_HIGH_RISK")).toBe(true);
    expect(isAntifraudRejection("cc_rejected_blacklist")).toBe(true);
    expect(isAntifraudRejection("rejected_by_bank")).toBe(true);
    expect(isAntifraudRejection("some_new_fraud_block")).toBe(true);
  });

  it("não trata recusa comum como antifraude", () => {
    expect(isAntifraudRejection("cc_rejected_insufficient_amount")).toBe(false);
    expect(isAntifraudRejection("cc_rejected_bad_filled_security_code")).toBe(false);
    expect(isAntifraudRejection("cc_rejected_bad_filled_date")).toBe(false);
    expect(isAntifraudRejection("cc_rejected_call_for_authorize")).toBe(false);
    expect(isAntifraudRejection("cc_rejected_card_disabled")).toBe(false);
    expect(isAntifraudRejection(null)).toBe(false);
    expect(isAntifraudRejection(undefined)).toBe(false);
  });
});

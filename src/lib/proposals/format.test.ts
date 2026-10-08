import { describe, expect, it } from "vitest";
import { formatProposalDate, formatProposalMoney, parseProposalAmount } from "@/lib/proposals/format";
import { fillMarca } from "@/lib/proposals/master";

describe("proposal amounts", () => {
  it("accepts whole dollar amounts", () => {
    expect(parseProposalAmount("15000")).toBe(15000);
    expect(parseProposalAmount(" 0 ")).toBe(0);
  });

  it("rejects separators and decimals", () => {
    expect(parseProposalAmount("15.000")).toBeNull();
    expect(parseProposalAmount("15,5")).toBeNull();
    expect(parseProposalAmount("")).toBeNull();
  });

  it("formats and fills the brand name", () => {
    expect(formatProposalMoney(15000)).toContain("15");
    expect(formatProposalDate("2026-12-31")).toMatch(/2026/);
    expect(fillMarca("Aliado {marca}", "Polar")).toBe("Aliado Polar");
  });
});

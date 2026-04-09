import { describe, it, expect } from "vitest";
import {
  deriveBenefitPlan,
  deriveBracketLabel,
  formatINR,
  parseINR,
  getTimeGreeting,
  getInitials,
  cn,
} from "../utils/helpers";

describe("deriveBenefitPlan", () => {
  it("returns Associate for salary < 5L", () => {
    expect(deriveBenefitPlan(400_000)).toBe("Associate");
  });
  it("returns Senior Associate for salary 5L-8L", () => {
    expect(deriveBenefitPlan(600_000)).toBe("Senior Associate");
  });
  it("returns Manager for salary 8L-12L", () => {
    expect(deriveBenefitPlan(1_000_000)).toBe("Manager");
  });
  it("returns Senior Manager for salary 12L-18L", () => {
    expect(deriveBenefitPlan(1_500_000)).toBe("Senior Manager");
  });
  it("returns AVP for salary 18L-25L", () => {
    expect(deriveBenefitPlan(2_000_000)).toBe("AVP");
  });
  it("returns VP for salary 25L+", () => {
    expect(deriveBenefitPlan(3_000_000)).toBe("VP");
  });
});

describe("deriveBracketLabel", () => {
  it("returns correct bracket for 6L salary", () => {
    expect(deriveBracketLabel(600_000)).toBe("₹5L – ₹8L");
  });
  it("returns ₹25L+ for high salary", () => {
    expect(deriveBracketLabel(3_000_000)).toBe("₹25L+");
  });
});

describe("formatINR", () => {
  it("formats currency in Indian style", () => {
    expect(formatINR(150000)).toBe("₹1,50,000");
  });
});

describe("parseINR", () => {
  it("parses INR string to number", () => {
    expect(parseINR("₹1,50,000")).toBe(150000);
  });
  it("returns 0 for invalid input", () => {
    expect(parseINR("abc")).toBe(0);
  });
});

describe("getTimeGreeting", () => {
  it("returns a greeting string", () => {
    const result = getTimeGreeting();
    expect(["Good morning", "Good afternoon", "Good evening"]).toContain(result);
  });
});

describe("getInitials", () => {
  it("returns two-letter initials for full name", () => {
    expect(getInitials("Raj Patel")).toBe("RP");
  });
  it("handles single name", () => {
    expect(getInitials("Raj")).toBe("RA");
  });
  it("handles three names", () => {
    expect(getInitials("Raj Kumar Patel")).toBe("RP");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });
});

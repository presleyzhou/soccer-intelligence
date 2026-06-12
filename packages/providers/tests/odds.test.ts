import { describe, expect, it } from "vitest";
import { impliedProbability, removeOverround } from "../src/index";

describe("odds normalization", () => {
  it("converts decimal odds", () => {
    expect(impliedProbability(2)).toBe(0.5);
  });

  it("removes overround and sums to one", () => {
    const values = removeOverround([2.1, 3.4, 3.8]);
    expect(values.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
    expect(values.every((value) => value > 0 && value < 1)).toBe(true);
  });
});

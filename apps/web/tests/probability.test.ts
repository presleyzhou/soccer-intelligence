import { describe, expect, it } from "vitest";
import { normalizeProbabilities } from "@wci/contracts";
import { conservativeEdge, fallbackMarkets, suggestedFraction } from "../lib/markets";

describe("probability safety", () => {
  it("normalizes values to one", () => {
    const result = normalizeProbabilities([4, 3, 2]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
  });

  it("never recommends a negative position", () => {
    expect(suggestedFraction(fallbackMarkets[1]!)).toBe(0);
  });

  it("deducts costs and uncertainty from market edge", () => {
    const market = fallbackMarkets[0]!;
    expect(conservativeEdge(market)).toBeCloseTo(market.modelProbability - market.bestAsk - 0.025, 12);
  });
});

import { describe, expect, it } from "vitest";
import { normalizeProbabilities } from "@wci/contracts";
import { predictMatch } from "../lib/prediction";
describe("probability normalization", () => {
  it("sums to one", () => {
    const values = normalizeProbabilities([2, 3, 5]);
    expect(values.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });
  it("handles invalid values", () => {
    expect(normalizeProbabilities([-1, Number.NaN, 0])).toEqual([1 / 3, 1 / 3, 1 / 3]);
  });
});

describe("multi-model match prediction", () => {
  it("normalizes every model and favors the stronger team", () => {
    const prediction = predictMatch(2100, 1800);
    for (const model of [prediction.elo, prediction.poisson, prediction.dixonColes, prediction.ensemble]) {
      expect(model.home + model.draw + model.away).toBeCloseTo(1, 10);
    }
    expect(prediction.ensemble.home).toBeGreaterThan(prediction.ensemble.away);
    expect(prediction.expectedGoals.home).toBeGreaterThan(prediction.expectedGoals.away);
  });

  it("produces a valid most-likely score", () => {
    const prediction = predictMatch(1950, 1930);
    expect(prediction.scoreline.home).toBeGreaterThanOrEqual(0);
    expect(prediction.scoreline.away).toBeGreaterThanOrEqual(0);
    expect(prediction.scoreline.probability).toBeGreaterThan(0);
    expect(prediction.disagreement).toBeGreaterThanOrEqual(0);
  });
});

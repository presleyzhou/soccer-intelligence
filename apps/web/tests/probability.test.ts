import { describe, expect, it } from "vitest";
import { normalizeProbabilities } from "@wci/contracts";
describe("probability normalization",()=>{it("sums to one",()=>{const values=normalizeProbabilities([2,3,5]);expect(values.reduce((a,b)=>a+b,0)).toBeCloseTo(1,12)});it("handles invalid values",()=>{expect(normalizeProbabilities([-1,Number.NaN,0])).toEqual([1/3,1/3,1/3])})});

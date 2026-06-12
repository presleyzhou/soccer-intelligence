import { describe, expect, it } from "vitest";
import { impliedProbability, MockProvider, removeOverround } from "../src/index.js";
describe("provider utilities",()=>{it("removes overround",()=>{const p=removeOverround([2,3.5,4]);expect(p.reduce((a,b)=>a+b,0)).toBeCloseTo(1,12)});it("converts odds",()=>expect(impliedProbability(2)).toBe(.5));it("returns mock records",async()=>{const provider=new MockProvider([{id:1}]);const result=await provider.fetch({}, {requestedAt:"2026-01-01T00:00:00Z"});expect(result.status).toBe("mock");expect(result.data).toHaveLength(1)})});

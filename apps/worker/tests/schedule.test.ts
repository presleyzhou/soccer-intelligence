import { describe, expect, it } from "vitest";
import { updateIntervalMinutes } from "../src/schedule";

describe("update cadence", () => {
  it("increases frequency near kickoff", () => {
    expect(updateIntervalMinutes(30)).toBe(60);
    expect(updateIntervalMinutes(12)).toBe(15);
    expect(updateIntervalMinutes(1)).toBe(5);
  });
});

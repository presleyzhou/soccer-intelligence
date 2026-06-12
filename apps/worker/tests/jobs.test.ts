import {describe,expect,it} from "vitest";import {runScheduledJobs} from "../src/index.js";
describe("scheduled jobs",()=>{it("degrades without football API key",async()=>{const jobs=await runScheduledJobs(new Date("2026-01-01T00:00:00Z"));expect(jobs.find(j=>j.job==="fixtures")?.status).toBe("unavailable");expect(jobs.find(j=>j.job==="daily-ratings")?.status).toBe("ready")})});

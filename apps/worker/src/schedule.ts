export type JobName = "ratings" | "markets" | "forecast" | "lineups" | "results";

export function updateIntervalMinutes(hoursUntilKickoff: number): number {
  if (hoursUntilKickoff <= 2) return 5;
  if (hoursUntilKickoff <= 24) return 15;
  return 60;
}

export const schedules: Record<JobName, string> = {
  ratings: "0 3 * * *",
  markets: "0 * * * *",
  forecast: "15 * * * *",
  lineups: "*/5 * * * *",
  results: "*/10 * * * *"
};

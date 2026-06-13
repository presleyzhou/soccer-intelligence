"use client";

import type { Locale } from "@wci/contracts";
import { Play, RefreshCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorldCupDates, type SportsDbEvent } from "@/lib/client-football-data";
import {
  currentGroupStandings,
  resolveTournamentTeams,
  runTournamentSimulation,
  type TeamSimulationResult,
  type TournamentSimulationResult,
  type TournamentTeam
} from "@/lib/tournament-simulation";

type EloSnapshot = {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  teams: Array<{ rank: number; code: string; rating: number; names: string[] }>;
};

type View = "full" | "groups" | "bracket";
type Status = "loading" | "ready" | "running" | "error";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function percent(value: number): string {
  if (value > 0 && value < 0.001) return "<0.1%";
  return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;
}

function ProbabilityCell({ value }: { value: number }) {
  return (
    <td>
      <span className="simulation-probability" style={{ "--probability": `${value * 100}%` } as CSSProperties}>
        {percent(value)}
      </span>
    </td>
  );
}

export function TournamentSimulator({ locale, view = "full" }: { locale: Locale; view?: View }) {
  const [status, setStatus] = useState<Status>("loading");
  const [events, setEvents] = useState<SportsDbEvent[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [snapshot, setSnapshot] = useState<EloSnapshot>();
  const [result, setResult] = useState<TournamentSimulationResult>();
  const [iterations, setIterations] = useState(50_000);
  const [adjustedTeam, setAdjustedTeam] = useState("");
  const [adjustment, setAdjustment] = useState(0);
  const [error, setError] = useState<string>();

  const run = useCallback(
    (sourceTeams: TournamentTeam[] = teams, sourceEvents: SportsDbEvent[] = events) => {
      if (!sourceTeams.length || !sourceEvents.length) return;
      setStatus("running");
      setError(undefined);
      window.setTimeout(() => {
        try {
          const adjusted = sourceTeams.map((team) => ({
            ...team,
            rating: team.name === adjustedTeam ? team.rating + adjustment : team.rating
          }));
          setResult(runTournamentSimulation(adjusted, sourceEvents, iterations));
          setStatus("ready");
        } catch (simulationError) {
          setError(simulationError instanceof Error ? simulationError.message : "Simulation failed");
          setStatus("error");
        }
      }, 30);
    },
    [adjustedTeam, adjustment, events, iterations, teams]
  );

  const load = useCallback(async () => {
    setStatus("loading");
    setError(undefined);
    try {
      const [eloResponse, loadedEvents] = await Promise.all([
        fetch(`${BASE_PATH}/data/world-elo.json`, { cache: "no-store" }),
        fetchWorldCupDates(["2026-06-11", "2026-07-19"])
      ]);
      if (!eloResponse.ok) throw new Error("Elo snapshot unavailable");
      const eloSnapshot = (await eloResponse.json()) as EloSnapshot;
      const groupEvents = loadedEvents.filter((event) => Boolean(event.strGroup));
      const resolvedTeams = resolveTournamentTeams(groupEvents, eloSnapshot);
      if (resolvedTeams.length !== 48 || groupEvents.length !== 72) {
        throw new Error(
          `Incomplete tournament feed: ${resolvedTeams.length} teams, ${groupEvents.length} group matches`
        );
      }
      setEvents(groupEvents);
      setTeams(resolvedTeams);
      setSnapshot(eloSnapshot);
      setStatus("ready");
      window.setTimeout(() => {
        try {
          setStatus("running");
          setResult(runTournamentSimulation(resolvedTeams, groupEvents, 50_000));
          setStatus("ready");
        } catch (simulationError) {
          setError(simulationError instanceof Error ? simulationError.message : "Simulation failed");
          setStatus("error");
        }
      }, 30);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Tournament data unavailable");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const standings = useMemo(() => currentGroupStandings(teams, events), [events, teams]);
  const probabilitiesByTeam = useMemo(() => new Map((result?.teams ?? []).map((team) => [team.team, team])), [result]);
  const groups = useMemo(
    () =>
      [..."ABCDEFGHIJKL"].map((group) => ({
        group,
        rows: standings.filter((standing) => standing.group === group)
      })),
    [standings]
  );

  return (
    <>
      <section className="card card-pad simulator-controls">
        <div className="section-header">
          <div>
            <p className="eyebrow">LIVE RESULTS · 50,000+ MONTE CARLO RUNS</p>
            <h2>{locale === "zh" ? "可复现的赛事模拟" : "Reproducible tournament simulation"}</h2>
          </div>
          <button className="pill" type="button" onClick={() => void load()}>
            <RefreshCw size={15} /> {status}
          </button>
        </div>
        <div className="notice live-notice">
          <ShieldCheck size={15} />
          {locale === "zh"
            ? "已结束赛果固定不变；未来比赛由当前 Elo 驱动的 Poisson 比分模型模拟。小组同分在净胜球、进球数后以 Elo 和固定随机种子近似官方后续规则。"
            : "Completed results stay fixed; future matches use an Elo-driven Poisson score model. Ties after points, goal difference, and goals scored approximate later official tiebreakers with Elo and a fixed seed."}
        </div>
        <div className="simulation-controls">
          <label>
            <span>{locale === "zh" ? "模拟次数" : "Iterations"}</span>
            <select value={iterations} onChange={(event) => setIterations(Number(event.target.value))}>
              <option value={10_000}>10,000</option>
              <option value={50_000}>50,000</option>
              <option value={100_000}>100,000</option>
            </select>
          </label>
          <label>
            <span>{locale === "zh" ? "情景球队" : "Scenario team"}</span>
            <select value={adjustedTeam} onChange={(event) => setAdjustedTeam(event.target.value)}>
              <option value="">{locale === "zh" ? "不调整" : "No adjustment"}</option>
              {teams.map((team) => (
                <option value={team.name} key={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              {locale === "zh" ? "实力修正" : "Strength adjustment"}: {adjustment > 0 ? "+" : ""}
              {adjustment} Elo
            </span>
            <input
              type="range"
              min={-150}
              max={150}
              step={25}
              value={adjustment}
              disabled={!adjustedTeam}
              onChange={(event) => setAdjustment(Number(event.target.value))}
            />
          </label>
          <button className="button primary" type="button" disabled={status === "running"} onClick={() => run()}>
            {status === "running" ? <RefreshCw className="spin" size={16} /> : <Play size={16} />}
            {locale === "zh" ? "运行模拟" : "Run simulation"}
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {snapshot ? (
          <p className="tiny muted">
            {locale === "zh" ? "输入" : "Inputs"}: ESPN FIFA World Cup ·{" "}
            <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">
              {snapshot.source}
            </a>{" "}
            ({new Date(snapshot.fetchedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}) ·{" "}
            {result?.iterations.toLocaleString() ?? "—"} {locale === "zh" ? "次模拟" : "runs"}
          </p>
        ) : null}
      </section>

      {view !== "groups" && result ? (
        <section className="section card card-pad">
          <div className="section-header">
            <div>
              <p className="eyebrow">TOURNAMENT PATH</p>
              <h2>{locale === "zh" ? "晋级与冠军概率" : "Advancement and title probabilities"}</h2>
            </div>
            <SlidersHorizontal size={20} color="var(--accent)" />
          </div>
          <div className="table-wrap">
            <table className="table simulation-table">
              <thead>
                <tr>
                  <th>{locale === "zh" ? "球队" : "Team"}</th>
                  <th>R32</th>
                  <th>R16</th>
                  <th>QF</th>
                  <th>SF</th>
                  <th>{locale === "zh" ? "决赛" : "Final"}</th>
                  <th>{locale === "zh" ? "冠军" : "Champion"}</th>
                </tr>
              </thead>
              <tbody>
                {result.teams.slice(0, view === "bracket" ? 48 : 24).map((team) => (
                  <tr key={team.team}>
                    <td>
                      <strong>{team.team}</strong>
                      <span className="tiny muted">
                        {" "}
                        Group {team.group} · Elo {team.rating}
                      </span>
                    </td>
                    <ProbabilityCell value={team.qualify} />
                    <ProbabilityCell value={team.round16} />
                    <ProbabilityCell value={team.quarterfinal} />
                    <ProbabilityCell value={team.semifinal} />
                    <ProbabilityCell value={team.final} />
                    <ProbabilityCell value={team.champion} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {view !== "bracket" && groups.length ? (
        <section className="section">
          <div className="section-header">
            <div>
              <p className="eyebrow">CURRENT TABLES + SIMULATED QUALIFICATION</p>
              <h2>{locale === "zh" ? "小组积分与出线概率" : "Group tables and qualification"}</h2>
            </div>
          </div>
          <div className="group-grid">
            {groups.map(({ group, rows }) => (
              <article className="card group-card" key={group}>
                <h2>
                  {locale === "zh" ? "小组" : "Group"} {group}
                </h2>
                <div className="group-table">
                  <div className="group-row group-head">
                    <span>{locale === "zh" ? "球队" : "Team"}</span>
                    <span>P</span>
                    <span>GD</span>
                    <span>Pts</span>
                    <span>{locale === "zh" ? "出线" : "Qual."}</span>
                  </div>
                  {rows.map((standing) => {
                    const probability = probabilitiesByTeam.get(standing.team) as TeamSimulationResult | undefined;
                    return (
                      <div className="group-row" key={standing.team}>
                        <strong>{standing.team}</strong>
                        <span>{standing.played}</span>
                        <span>
                          {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                        </span>
                        <span>{standing.points}</span>
                        <span className="accent-text">{probability ? percent(probability.qualify) : "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card card-pad simulation-caveat">
        <h2>{locale === "zh" ? "边界与解释" : "Scope and interpretation"}</h2>
        <p className="muted">
          {locale === "zh"
            ? "这是研究型基线，不含尚未确认的首发、伤停、天气和市场信息。八个最佳第三名按官方已公布的候选小组约束进行贪心分配；当多个合法分配同时存在时，这一近似可能轻微影响路径概率。所有数字是条件概率，不是赛果保证。"
            : "This is a research baseline without unconfirmed lineups, injuries, weather, or market inputs. The eight best third-place teams are greedily assigned within the published eligible-group constraints; when several legal assignments exist, this approximation can slightly affect path probabilities. All numbers are conditional probabilities, not guarantees."}
        </p>
      </section>
    </>
  );
}

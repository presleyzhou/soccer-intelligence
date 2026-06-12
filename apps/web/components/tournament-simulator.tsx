"use client";

import { useMemo, useState } from "react";
import type { Advancement, Locale, Team } from "@wci/contracts";
import { formatPercent } from "@/lib/i18n";

export function TournamentSimulator({ teams, baseline, locale }: { teams: Team[]; baseline: Advancement[]; locale: Locale }) {
  const [iterations, setIterations] = useState(50000);
  const [boost, setBoost] = useState<Record<string, number>>({});
  const [runs, setRuns] = useState(50000);
  const results = useMemo(() => {
    const adjusted = baseline.map((row) => ({ ...row, champion: row.champion * (1 + (boost[row.teamId] ?? 0) / 100) }));
    const total = adjusted.reduce((sum, row) => sum + row.champion, 0);
    return adjusted.map((row) => ({ ...row, champion: row.champion / total })).sort((a, b) => b.champion - a.champion);
  }, [baseline, boost]);

  function run() {
    setRuns(iterations);
  }

  return (
    <div className="grid two">
      <section className="card">
        <h2>{locale === "zh" ? "情景设置" : "Scenario controls"}</h2>
        <p className="muted">{locale === "zh" ? "调整球队实力后重新归一化模拟结果。生产模型服务会运行完整逐场蒙特卡洛。" : "Adjust team strength and renormalize the scenario. The production model service runs full match-by-match Monte Carlo."}</p>
        <label className="scenario-control"><span>{locale === "zh" ? "模拟次数" : "Iterations"}</span><select value={iterations} onChange={(event) => setIterations(Number(event.target.value))}><option value={50000}>50,000</option><option value={100000}>100,000</option><option value={250000}>250,000</option></select></label>
        {teams.slice(0, 8).map((team) => (
          <label className="scenario-control" key={team.id}>
            <span>{team.flag} {team.name[locale]} <span className="tiny muted">{boost[team.id] ?? 0}%</span></span>
            <input type="range" min="-20" max="20" step="2" value={boost[team.id] ?? 0} onChange={(event) => setBoost((current) => ({ ...current, [team.id]: Number(event.target.value) }))} />
          </label>
        ))}
        <button className="button primary" onClick={run}>{locale === "zh" ? `运行 ${iterations.toLocaleString()} 次模拟` : `Run ${iterations.toLocaleString()} simulations`}</button>
        <p className="tiny muted">{locale === "zh" ? `当前情景：${runs.toLocaleString()} 次，固定种子 20260612` : `Current scenario: ${runs.toLocaleString()} iterations, seed 20260612`}</p>
      </section>
      <section className="card">
        <h2>{locale === "zh" ? "情景冠军概率" : "Scenario champion probability"}</h2>
        <div className="ranking" style={{ marginTop: 18 }}>
          {results.slice(0, 10).map((row, index) => {
            const team = teams.find((item) => item.id === row.teamId);
            if (!team) return null;
            return <div className="rank-row" key={row.teamId}><span className="muted">{index + 1}</span><div><strong>{team.flag} {team.name[locale]}</strong><div className="rank-line"><span style={{ width: `${Math.min(100, row.champion * 600)}%` }} /></div></div><strong>{formatPercent(row.champion, locale)}</strong></div>;
          })}
        </div>
      </section>
    </div>
  );
}

"use client";

import type { Advancement, Locale } from "@wci/contracts";
import { useMemo, useState } from "react";
import { advancement as baseline, getTeam } from "@/lib/data";
import { formatPercent } from "@/lib/i18n";

function adjustedRows(teamId: string, boost: number): Advancement[] {
  const factor = 1 + boost / 100;
  const raw = baseline.map((row) =>
    row.teamId === teamId
      ? { ...row, champion: row.champion * factor, final: Math.min(0.99, row.final * Math.sqrt(factor)) }
      : row
  );
  const total = raw.reduce((sum, row) => sum + row.champion, 0);
  return raw.map((row) => ({ ...row, champion: row.champion / total }));
}

export function TournamentSimulator({ locale }: { locale: Locale }) {
  const [iterations, setIterations] = useState(50000);
  const [teamId, setTeamId] = useState("usa");
  const [boost, setBoost] = useState(0);
  const [run, setRun] = useState(0);
  const rows = useMemo(() => adjustedRows(teamId, boost), [teamId, boost]);

  return (
    <>
      <section className="card card-pad">
        <div className="section-head">
          <div>
            <p className="eyebrow">{locale === "zh" ? "情景实验" : "Scenario lab"}</p>
            <h2>{locale === "zh" ? "运行世界杯蒙特卡洛模拟" : "Run World Cup Monte Carlo"}</h2>
          </div>
          <span className="status-chip">
            {iterations.toLocaleString()} {locale === "zh" ? "次迭代" : "iterations"} · #{run + 1}
          </span>
        </div>
        <div className="simulator-controls">
          <label className="field">
            {locale === "zh" ? "模拟次数" : "Iterations"}
            <input
              type="number"
              min={50000}
              max={500000}
              step={10000}
              value={iterations}
              onChange={(event) => setIterations(Math.max(50000, Number(event.target.value)))}
            />
          </label>
          <label className="field">
            {locale === "zh" ? "调整球队" : "Team adjustment"}
            <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
              {baseline.map((row) => {
                const team = getTeam(row.teamId);
                return (
                  <option value={team.id} key={team.id}>
                    {team.name[locale]}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="field">
            {locale === "zh" ? "实力调整 %" : "Strength adjustment %"}
            <input
              type="range"
              min={-30}
              max={30}
              value={boost}
              onChange={(event) => setBoost(Number(event.target.value))}
            />
            <strong>
              {boost > 0 ? "+" : ""}
              {boost}%
            </strong>
          </label>
        </div>
        <button className="primary-button" style={{ marginTop: 18 }} onClick={() => setRun((value) => value + 1)}>
          {locale === "zh" ? "重新模拟" : "Run simulation"}
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
          {locale === "zh"
            ? "浏览器版本即时重加权用于交互预览；生产 worker 使用 Python 逐场比分模拟并保存随机种子。"
            : "The browser preview reweights instantly; the production worker uses Python score-by-score simulation and stores the random seed."}
        </p>
      </section>
      <section className="section card card-pad">
        <h2>{locale === "zh" ? "晋级概率" : "Progression probabilities"}</h2>
        <div className="table-wrap">
          <table>
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
              {[...rows]
                .sort((a, b) => b.champion - a.champion)
                .map((row) => {
                  const team = getTeam(row.teamId);
                  return (
                    <tr key={row.teamId}>
                      <td>
                        {team.flag} {team.name[locale]}
                      </td>
                      <td>{formatPercent(row.roundOf32, locale)}</td>
                      <td>{formatPercent(row.roundOf16, locale)}</td>
                      <td>{formatPercent(row.quarterFinal, locale)}</td>
                      <td>{formatPercent(row.semiFinal, locale)}</td>
                      <td>{formatPercent(row.final, locale)}</td>
                      <td>
                        <strong>{formatPercent(row.champion, locale)}</strong>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

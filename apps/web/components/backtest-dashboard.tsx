"use client";

import type { Locale } from "@wci/contracts";
import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MetricRow = {
  matches: number;
  logLoss: number | null;
  brier: number | null;
  rps: number | null;
  accuracy: number | null;
};

type BacktestPayload = {
  generatedAt: string;
  source: { name: string; url: string; repository: string };
  methodology: {
    model: string;
    warmupStart: string | null;
    evaluationStart: string;
    evaluationEnd: string | null;
    homeAdvantage: number;
    leakageControl: string;
  };
  overall: MetricRow & { expectedCalibrationError: number };
  byCompetition: Record<string, MetricRow>;
  byYear: Array<MetricRow & { year: string }>;
  calibration: Array<{
    lower: number;
    upper: number;
    matches: number;
    meanConfidence: number;
    accuracy: number;
  }>;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function decimal(value: number | null, digits = 3): string {
  return value === null ? "—" : value.toFixed(digits);
}

function percent(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export function BacktestDashboard({ locale }: { locale: Locale }) {
  const [data, setData] = useState<BacktestPayload>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch(`${BASE_PATH}/data/backtest.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Backtest returned ${response.status}`);
      setData((await response.json()) as BacktestPayload);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const yearly = useMemo(
    () =>
      (data?.byYear ?? []).map((row) => ({
        ...row,
        accuracyPercent: row.accuracy === null ? null : row.accuracy * 100
      })),
    [data]
  );
  const calibration = useMemo(
    () =>
      (data?.calibration ?? []).map((row) => ({
        ...row,
        confidencePercent: row.meanConfidence * 100,
        accuracyPercent: row.accuracy * 100,
        perfectPercent: row.meanConfidence * 100
      })),
    [data]
  );

  if (status === "error") {
    return (
      <section className="card empty-state">
        <h2>{locale === "zh" ? "回测快照暂不可用" : "Backtest snapshot unavailable"}</h2>
        <button className="button" type="button" onClick={() => void load()}>
          <RefreshCw size={15} /> {locale === "zh" ? "重试" : "Retry"}
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="card empty-state">
        {locale === "zh" ? "正在载入真实回测…" : "Loading real backtest..."}
      </section>
    );
  }

  const competitionLabels: Record<string, string> = {
    worldCup: locale === "zh" ? "世界杯" : "World Cup",
    qualifiers: locale === "zh" ? "预选赛" : "Qualifiers",
    continental: locale === "zh" ? "洲际赛事" : "Continental",
    friendlies: locale === "zh" ? "友谊赛" : "Friendlies",
    other: locale === "zh" ? "其他赛事" : "Other"
  };

  return (
    <>
      <section className="card card-pad">
        <div className="section-header">
          <div>
            <p className="eyebrow">STRICT CHRONOLOGICAL EVALUATION</p>
            <h2>{locale === "zh" ? "滚动样本外 Elo 基线" : "Rolling out-of-time Elo baseline"}</h2>
          </div>
          <span className="pill">
            <CheckCircle2 size={15} /> {data.overall.matches.toLocaleString()} matches
          </span>
        </div>
        <div className="notice live-notice">
          <ShieldCheck size={15} />
          {locale === "zh"
            ? "每场比赛都先用当时已有评级生成概率，赛果出现后才更新评级。没有随机训练/测试拆分。"
            : "Every probability is generated from ratings available at that time; ratings update only after the result. No random train/test split."}
        </div>
        <div className="metric-grid backtest-metrics">
          <div className="metric">
            <span>Log Loss</span>
            <strong>{decimal(data.overall.logLoss)}</strong>
          </div>
          <div className="metric">
            <span>Brier</span>
            <strong>{decimal(data.overall.brier)}</strong>
          </div>
          <div className="metric">
            <span>RPS</span>
            <strong>{decimal(data.overall.rps)}</strong>
          </div>
          <div className="metric">
            <span>ECE</span>
            <strong>{percent(data.overall.expectedCalibrationError)}</strong>
          </div>
          <div className="metric">
            <span>{locale === "zh" ? "准确率" : "Accuracy"}</span>
            <strong>{percent(data.overall.accuracy)}</strong>
          </div>
        </div>
        <p className="tiny muted">
          {locale === "zh" ? "评估期" : "Evaluation"}: {data.methodology.evaluationStart} –{" "}
          {data.methodology.evaluationEnd}
          {" · "}
          {locale === "zh" ? "生成时间" : "Generated"}:{" "}
          {new Date(data.generatedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
        </p>
      </section>

      <section className="section grid two">
        <article className="card chart-card">
          <h2>{locale === "zh" ? "年度概率质量" : "Probability quality by year"}</h2>
          <p className="tiny muted">
            {locale === "zh" ? "Log Loss、RPS 越低越好。" : "Lower Log Loss and RPS are better."}
          </p>
          <div className="backtest-chart">
            <ResponsiveContainer>
              <LineChart data={yearly} margin={{ top: 10, right: 14, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted)" fontSize={11} minTickGap={20} />
                <YAxis stroke="var(--muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="logLoss"
                  name="Log Loss"
                  stroke="var(--gold)"
                  dot={false}
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="rps" name="RPS" stroke="var(--accent)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="card chart-card">
          <h2>{locale === "zh" ? "置信度校准" : "Confidence calibration"}</h2>
          <p className="tiny muted">
            {locale === "zh" ? "实际命中率越接近对角线，概率越可信。" : "Reliable probabilities track the diagonal."}
          </p>
          <div className="backtest-chart">
            <ResponsiveContainer>
              <LineChart data={calibration} margin={{ top: 10, right: 14, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" />
                <XAxis dataKey="confidencePercent" unit="%" stroke="var(--muted)" fontSize={11} />
                <YAxis domain={[0, 100]} unit="%" stroke="var(--muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}
                />
                <Legend />
                <Line
                  dataKey="perfectPercent"
                  name={locale === "zh" ? "理想校准" : "Perfect"}
                  stroke="var(--muted)"
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  dataKey="accuracyPercent"
                  name={locale === "zh" ? "实际命中" : "Observed"}
                  stroke="var(--accent)"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="card card-pad">
        <div className="section-header">
          <div>
            <p className="eyebrow">SEGMENT CHECK</p>
            <h2>{locale === "zh" ? "按赛事类型评估" : "Evaluation by competition type"}</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{locale === "zh" ? "赛事" : "Competition"}</th>
                <th>{locale === "zh" ? "场次" : "Matches"}</th>
                <th>Log Loss</th>
                <th>Brier</th>
                <th>RPS</th>
                <th>{locale === "zh" ? "准确率" : "Accuracy"}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.byCompetition).map(([key, row]) => (
                <tr key={key}>
                  <td>
                    <strong>{competitionLabels[key] ?? key}</strong>
                  </td>
                  <td>{row.matches.toLocaleString()}</td>
                  <td>{decimal(row.logLoss)}</td>
                  <td>{decimal(row.brier)}</td>
                  <td>{decimal(row.rps)}</td>
                  <td>{percent(row.accuracy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section card card-pad">
        <h2>{locale === "zh" ? "如何解读" : "How to read this"}</h2>
        <p className="muted">
          {locale === "zh"
            ? "这是一条透明、可复现的 Elo 三分类基线，用来证明评估管线能工作，并不等于首页集成模型已经完成校准。模型选择应优先比较 Log Loss、RPS 和校准，而不是宣传单一准确率。"
            : "This is a transparent, reproducible three-way Elo baseline that validates the evaluation pipeline. It does not imply the homepage ensemble is calibrated. Model selection should prioritize Log Loss, RPS, and calibration over a headline accuracy number."}
        </p>
        <p className="tiny muted">
          {locale === "zh" ? "数据源" : "Source"}:{" "}
          <a href={data.source.repository} target="_blank" rel="noreferrer">
            {data.source.name}
          </a>
          {" · "}
          {data.methodology.leakageControl}
        </p>
      </section>
    </>
  );
}

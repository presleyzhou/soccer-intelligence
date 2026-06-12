import type { Locale } from "@wci/contracts";
import { ArrowRight, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ChampionList } from "@/components/champion-list";
import { MatchCard } from "@/components/match-card";
import { PerformanceChart } from "@/components/performance-chart";
import { advancement, getTeam, matches, modelMetrics, sources } from "@/lib/data";
import { formatDate, formatPercent, getCopy, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = getCopy(locale);
  const spotlight = matches[0];
  if (!spotlight) throw new Error("No spotlight match configured");

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">{t.nextSpotlight}</p>
          <h1>{t.brand}</h1>
          <p className="lead">
            {t.tagline}.{" "}
            {locale === "zh"
              ? "从比分分布到世界杯路径，每个结论都保留模型版本、数据时间和来源。"
              : "From score distributions to tournament paths, every conclusion retains its model version, data time, and sources."}
          </p>
          <div className="toolbar">
            <Link className="primary-button" href={`/${locale}/matches/${spotlight.id}`}>
              {locale === "zh" ? "查看焦点预测" : "Open spotlight"} <ArrowRight size={15} />
            </Link>
            <span className="score-chip">
              {t.modelUpdated}: {formatDate(spotlight.prediction.updatedAt, locale)}
            </span>
          </div>
        </div>
      </section>

      <section className="section grid dashboard-grid">
        <div>
          <div className="section-head">
            <div>
              <p className="eyebrow">{t.nextSpotlight}</p>
              <h2>{t.probability}</h2>
            </div>
          </div>
          <MatchCard match={spotlight} locale={locale} featured />
          <div className="section">
            <div className="section-head">
              <h2>{t.recentMatches}</h2>
              <Link className="muted" href={`/${locale}/matches`}>
                {locale === "zh" ? "全部比赛 →" : "All matches →"}
              </Link>
            </div>
            <div className="grid grid-2">
              {matches.slice(1, 3).map((match) => (
                <MatchCard key={match.id} match={match} locale={locale} />
              ))}
            </div>
          </div>
        </div>
        <aside className="grid">
          <section className="card card-pad">
            <div className="section-head">
              <h2>{t.championRace}</h2>
            </div>
            <ChampionList locale={locale} />
          </section>
          <section className="card card-pad">
            <div className="section-head">
              <h2>{t.sourceStatus}</h2>
            </div>
            <div className="rank-list">
              {sources.map((source) => (
                <div className="source-row" key={source.id}>
                  <span>
                    <Database size={14} /> {source.name}
                  </span>
                  <span className={`status-chip ${source.status === "live" ? "live" : ""}`}>{source.status}</span>
                </div>
              ))}
            </div>
            <p className="notice" style={{ marginTop: 16 }}>
              {t.simulated}
            </p>
          </section>
        </aside>
      </section>

      <section className="section card card-pad">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t.performance}</p>
            <h2>{locale === "zh" ? "严格时间序列样本外表现" : "Strict time-ordered out-of-sample performance"}</h2>
          </div>
          <ShieldCheck color="var(--accent)" />
        </div>
        <div className="kpi-grid">
          <div className="kpi">
            <span>Log Loss</span>
            <strong>{modelMetrics.logLoss}</strong>
          </div>
          <div className="kpi">
            <span>Brier</span>
            <strong>{modelMetrics.brier}</strong>
          </div>
          <div className="kpi">
            <span>RPS</span>
            <strong>{modelMetrics.rps}</strong>
          </div>
          <div className="kpi">
            <span>ECE</span>
            <strong>{modelMetrics.ece}</strong>
          </div>
          <div className="kpi">
            <span>{locale === "zh" ? "准确率" : "Accuracy"}</span>
            <strong>{formatPercent(modelMetrics.accuracy, locale)}</strong>
          </div>
        </div>
        <PerformanceChart locale={locale} />
        <p className="muted">
          {locale === "zh"
            ? `示例回测窗口，共 ${modelMetrics.sampleSize} 场；部署真实数据后由版本化回测替换。`
            : `Demonstration backtest window, ${modelMetrics.sampleSize} matches; replaced by versioned backtests when real data is configured.`}
        </p>
      </section>

      <section className="section card card-pad">
        <div className="section-head">
          <h2>{t.qualification}</h2>
          <Link className="muted" href={`/${locale}/tournament`}>
            {locale === "zh" ? "打开模拟器 →" : "Open simulator →"}
          </Link>
        </div>
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
              {advancement.slice(0, 8).map((row) => {
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
    </main>
  );
}

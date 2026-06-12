import { Activity, Clock3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { MatchRow } from "@/components/match-card";
import { ProbabilityBar } from "@/components/probability-bar";
import { advancement, getTeam, matches, modelMetrics, sources } from "@/lib/data";
import { formatDate, formatPercent, getCopy, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getCopy(locale);
  const featured = matches[0]!;
  const home = getTeam(featured.homeTeamId);
  const away = getTeam(featured.awayTeamId);
  const leaders = advancement.slice().sort((a, b) => b.champion - a.champion).slice(0, 6);
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">FIFA WORLD CUP 2026 · MODEL v0.1.0</div>
          <h1>{t.tagline}</h1>
          <p className="lead">{locale === "zh" ? "融合球队实力、比分分布与市场共识，以严格时间外验证发布每场比赛和完整赛事的概率。" : "Team strength, score distributions and market consensus combined through strict out-of-time validation for every match and the full tournament."}</p>
          <span className="notice">{t.simulated}</span>
        </div>
      </section>

      <div className="container grid dashboard-grid">
        <div>
          <section className="card">
            <div className="section-header">
              <div><div className="eyebrow">{t.nextSpotlight}</div><h2>{formatDate(featured.kickoffAt, locale)}</h2></div>
              <span className="pill"><TrendingUp size={14} /> {featured.attention}/100</span>
            </div>
            <div className="versus">
              <div className="team-row"><span className="flag">{home.flag}</span><div><div className="team-name">{home.name[locale]}</div><div className="team-meta">FIFA #{home.fifaRank} · Elo {home.elo}</div></div></div>
              <strong>VS</strong>
              <div className="team-row"><span className="flag">{away.flag}</span><div><div className="team-name">{away.name[locale]}</div><div className="team-meta">FIFA #{away.fifaRank} · Elo {away.elo}</div></div></div>
            </div>
            <ProbabilityBar values={[featured.prediction.home, featured.prediction.draw, featured.prediction.away]} locale={locale} />
            <div className="section-header" style={{ marginTop: 18 }}>
              <span className="muted">{t.likelyScore}: <strong style={{ color: "var(--text)" }}>{featured.prediction.scorelines[0]!.home}–{featured.prediction.scorelines[0]!.away}</strong></span>
              <Link className="button primary" href={`/${locale}/matches/${featured.id}`}>{locale === "zh" ? "查看完整分析" : "Full analysis"}</Link>
            </div>
          </section>
          <section className="section">
            <div className="section-header"><h2>{t.recentMatches}</h2><Link className="muted tiny" href={`/${locale}/matches`}>{locale === "zh" ? "全部比赛 →" : "All matches →"}</Link></div>
            <div className="match-list">{matches.slice(1).map((match) => <MatchRow key={match.id} match={match} locale={locale} />)}</div>
          </section>
        </div>
        <aside className="grid">
          <section className="card">
            <div className="section-header"><h2>{t.championRace}</h2><Activity size={18} color="var(--accent)" /></div>
            <div className="ranking">
              {leaders.map((row, index) => {
                const team = getTeam(row.teamId);
                return <div className="rank-row" key={team.id}><span className="muted">{index + 1}</span><div><div>{team.flag} <strong>{team.name[locale]}</strong></div><div className="rank-line"><span style={{ width: `${row.champion * 600}%` }} /></div></div><strong>{formatPercent(row.champion, locale)}</strong></div>;
              })}
            </div>
          </section>
          <section className="card soft">
            <h2>{t.performance}</h2>
            <p className="tiny muted">{locale === "zh" ? `滚动样本外验证，${modelMetrics.sampleSize} 场` : `Rolling out-of-time validation, ${modelMetrics.sampleSize} matches`}</p>
            <div className="metric-grid">
              <div className="metric"><strong>{modelMetrics.rps}</strong><span className="tiny muted">RPS</span></div>
              <div className="metric"><strong>{modelMetrics.logLoss}</strong><span className="tiny muted">Log loss</span></div>
              <div className="metric"><strong>{formatPercent(modelMetrics.ece, locale)}</strong><span className="tiny muted">ECE</span></div>
            </div>
          </section>
          <section className="card soft">
            <h2>{t.sourceStatus}</h2>
            <div style={{ marginTop: 10 }}>{sources.map((source) => <span className="source-chip" key={source.id}><span className="status-dot" />{source.name} · {source.status}</span>)}</div>
            <p className="tiny muted"><Clock3 size={12} /> {t.modelUpdated}: {formatDate(featured.prediction.updatedAt, locale)}</p>
          </section>
        </aside>
      </div>
    </main>
  );
}

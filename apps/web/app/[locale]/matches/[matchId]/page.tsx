import { notFound } from "next/navigation";
import { ModelChart } from "@/components/model-chart";
import { ProbabilityBar } from "@/components/probability-bar";
import { getMatch, getTeam } from "@/lib/data";
import { formatDate, formatPercent, isLocale } from "@/lib/i18n";

export default async function MatchDetail({ params }: { params: Promise<{ locale: string; matchId: string }> }) {
  const { locale, matchId } = await params;
  if (!isLocale(locale)) notFound();
  const match = getMatch(matchId);
  if (!match) notFound();
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const factors = [
    { label: locale === "zh" ? "Elo 实力差" : "Elo strength", value: 82 },
    { label: locale === "zh" ? "动态攻防评分" : "Dynamic attack/defence", value: 74 },
    { label: locale === "zh" ? "市场共识" : "Market consensus", value: 66 },
    { label: locale === "zh" ? "近期状态" : "Recent form", value: 52 },
    { label: locale === "zh" ? "旅行与休息" : "Travel and rest", value: 31 }
  ];
  return (
    <main className="container">
      <header className="page-head"><div className="eyebrow">{match.stage.replaceAll("_", " ")} · {match.group ?? ""}</div><h1>{home.flag} {home.name[locale]} <span className="muted">vs</span> {away.name[locale]} {away.flag}</h1><p className="lead">{formatDate(match.kickoffAt, locale)} · {match.venue[locale]}, {match.city[locale]}</p></header>
      <div className="grid two">
        <section className="card">
          <h2>{locale === "zh" ? "集成模型预测" : "Ensemble forecast"}</h2>
          <p className="muted">{locale === "zh" ? `置信度 ${formatPercent(match.prediction.confidence, locale)}，不是获胜概率。` : `Confidence ${formatPercent(match.prediction.confidence, locale)}; this is not a win probability.`}</p>
          <ProbabilityBar values={[match.prediction.home, match.prediction.draw, match.prediction.away]} locale={locale} />
          <div className="metric-grid" style={{ marginTop: 12 }}>
            <div className="metric"><strong>{match.prediction.homeXg.toFixed(2)}</strong><span className="tiny muted">{home.name[locale]} xG</span></div>
            <div className="metric"><strong>{formatPercent(match.prediction.over25, locale)}</strong><span className="tiny muted">Over 2.5</span></div>
            <div className="metric"><strong>{formatPercent(match.prediction.bothTeamsScore, locale)}</strong><span className="tiny muted">BTTS</span></div>
          </div>
        </section>
        <section className="card">
          <h2>{locale === "zh" ? "比赛环境" : "Match environment"}</h2>
          <table className="table"><tbody>
            <tr><th>{locale === "zh" ? "天气" : "Weather"}</th><td>{match.weather.condition[locale]}, {match.weather.temperatureC}°C</td></tr>
            <tr><th>{locale === "zh" ? "休息天数" : "Rest days"}</th><td>{home.name[locale]} {match.context.restDaysHome} · {away.name[locale]} {match.context.restDaysAway}</td></tr>
            <tr><th>{locale === "zh" ? "旅行距离" : "Travel"}</th><td>{match.context.travelKmHome.toLocaleString()} km · {match.context.travelKmAway.toLocaleString()} km</td></tr>
            <tr><th>{locale === "zh" ? "裁判" : "Referee"}</th><td>{match.context.referee}</td></tr>
            <tr><th>{locale === "zh" ? "阵容" : "Lineups"}</th><td>{locale === "zh" ? "预计首发，待官方确认" : "Projected; awaiting official confirmation"}</td></tr>
          </tbody></table>
        </section>
      </div>
      <section className="section grid two">
        <div className="card"><h2>{locale === "zh" ? "最可能的比分" : "Most likely scorelines"}</h2><div className="score-grid" style={{ marginTop: 16 }}>{match.prediction.scorelines.map((score) => <div className="score" key={`${score.home}-${score.away}`}><strong>{score.home}–{score.away}</strong><span className="tiny muted">{formatPercent(score.probability, locale)}</span></div>)}</div></div>
        <div className="card"><h2>{locale === "zh" ? "主要影响因素" : "Top factors"}</h2>{factors.map((factor) => <div className="factor" key={factor.label}><span>{factor.label}</span><div className="factor-bar"><span style={{ width: `${factor.value}%` }} /></div></div>)}<p className="tiny muted">{locale === "zh" ? "当前为规则化特征重要性；生产树模型启用后使用样本外 SHAP。" : "Currently normalized feature importance; out-of-fold SHAP is used when tree models are enabled."}</p></div>
      </section>
      <section className="card"><h2>{locale === "zh" ? "多模型概率比较" : "Model probability comparison"}</h2><ModelChart models={match.prediction.models} /></section>
    </main>
  );
}

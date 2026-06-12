import type { Locale } from "@wci/contracts";
import { CloudSun, Gauge, MapPin, Plane, ShieldQuestion, Timer } from "lucide-react";
import { notFound } from "next/navigation";
import { ModelComparisonChart } from "@/components/metric-chart";
import { ProbabilityBar } from "@/components/probability-bar";
import { getMatch, getTeam } from "@/lib/data";
import { formatDate, formatPercent, isLocale } from "@/lib/i18n";

export default async function MatchDetailPage({ params }: { params: Promise<{ locale: string; matchId: string }> }) {
  const { locale: rawLocale, matchId } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const match = getMatch(matchId);
  if (!match) notFound();
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const factors = [
    { label: locale === "zh" ? "Elo 实力差" : "Elo strength gap", value: 82, impact: "+4.2%" },
    { label: locale === "zh" ? "近期攻防状态" : "Recent attack/defence", value: 68, impact: "+2.8%" },
    { label: locale === "zh" ? "市场共识" : "Market consensus", value: 62, impact: "+1.9%" },
    { label: locale === "zh" ? "休息与旅行" : "Rest and travel", value: 41, impact: "-0.7%" },
    { label: locale === "zh" ? "阵容信息质量" : "Lineup information quality", value: 28, impact: "±1.2%" }
  ];

  return (
    <main className="page">
      <section className="detail-hero">
        <div className="card card-pad">
          <div className="match-meta">
            <span>
              {match.stage.replaceAll("_", " ")} {match.group ? `· Group ${match.group}` : ""}
            </span>
            <span>{formatDate(match.kickoffAt, locale)}</span>
          </div>
          <div className="team-pair" style={{ margin: "36px 0" }}>
            <div className="team">
              <span className="flag">{home.flag}</span>
              <div>
                <h2>{home.name[locale]}</h2>
                <span className="muted">
                  FIFA #{home.fifaRank} · Elo {home.elo}
                </span>
              </div>
            </div>
            <span className="versus">VS</span>
            <div className="team away">
              <div>
                <h2>{away.name[locale]}</h2>
                <span className="muted">
                  FIFA #{away.fifaRank} · Elo {away.elo}
                </span>
              </div>
              <span className="flag">{away.flag}</span>
            </div>
          </div>
          <ProbabilityBar {...match.prediction} locale={locale} />
          <p className="muted" style={{ marginTop: 18 }}>
            {locale === "zh"
              ? "90 分钟赛果概率，不包含加时和点球。"
              : "90-minute result probabilities, excluding extra time and penalties."}
          </p>
        </div>
        <aside className="card card-pad">
          <p className="eyebrow">{locale === "zh" ? "比赛环境" : "Match context"}</p>
          <div className="rank-list">
            <div className="metric-row">
              <span>
                <MapPin size={15} /> {match.venue[locale]}
              </span>
              <strong>{match.city[locale]}</strong>
            </div>
            <div className="metric-row">
              <span>
                <CloudSun size={15} /> {match.weather.condition[locale]}
              </span>
              <strong>{match.weather.temperatureC}°C</strong>
            </div>
            <div className="metric-row">
              <span>
                <Timer size={15} /> {locale === "zh" ? "休息天数" : "Rest days"}
              </span>
              <strong>
                {match.context.restDaysHome} / {match.context.restDaysAway}
              </strong>
            </div>
            <div className="metric-row">
              <span>
                <Plane size={15} /> {locale === "zh" ? "旅行距离" : "Travel"}
              </span>
              <strong>
                {match.context.travelKmHome} / {match.context.travelKmAway} km
              </strong>
            </div>
            <div className="metric-row">
              <span>
                <ShieldQuestion size={15} /> {locale === "zh" ? "裁判" : "Referee"}
              </span>
              <strong>{match.context.referee}</strong>
            </div>
          </div>
          <div className="notice" style={{ marginTop: 18 }}>
            {locale === "zh"
              ? "预计首发和伤停当前为 Mock/待确认状态，模型会降低其权重。"
              : "Expected lineups and injuries are currently mock/unconfirmed, so the model reduces their weight."}
          </div>
        </aside>
      </section>

      <section className="section grid grid-3">
        <div className="card card-pad">
          <span className="muted">{locale === "zh" ? "预期进球" : "Expected goals"}</span>
          <h2>
            {match.prediction.homeXg.toFixed(2)} - {match.prediction.awayXg.toFixed(2)}
          </h2>
        </div>
        <div className="card card-pad">
          <span className="muted">{locale === "zh" ? "双方进球" : "Both teams score"}</span>
          <h2>{formatPercent(match.prediction.bothTeamsScore, locale)}</h2>
        </div>
        <div className="card card-pad">
          <span className="muted">{locale === "zh" ? "大于 2.5 球" : "Over 2.5 goals"}</span>
          <h2>{formatPercent(match.prediction.over25, locale)}</h2>
        </div>
      </section>

      <section className="section card card-pad">
        <div className="section-head">
          <h2>{locale === "zh" ? "最可能的五个比分" : "Top five scorelines"}</h2>
          <span className="status-chip">
            <Gauge size={14} /> {locale === "zh" ? "置信度" : "Confidence"}{" "}
            {formatPercent(match.prediction.confidence, locale)}
          </span>
        </div>
        <div className="scoreline-list">
          {match.prediction.scorelines.map((score) => (
            <div className="scoreline" key={`${score.home}-${score.away}`}>
              <strong>
                {score.home}-{score.away}
              </strong>
              <span className="muted">{formatPercent(score.probability, locale)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section card card-pad">
        <div className="section-head">
          <div>
            <p className="eyebrow">{locale === "zh" ? "模型分歧" : "Model disagreement"}</p>
            <h2>{locale === "zh" ? "各模型胜平负概率" : "1X2 probabilities by model"}</h2>
          </div>
        </div>
        <ModelComparisonChart models={match.prediction.models} locale={locale} />
      </section>

      <section className="section grid grid-2">
        <div className="card card-pad">
          <h2>{locale === "zh" ? "预测驱动因素" : "Forecast drivers"}</h2>
          {factors.map((factor) => (
            <div className="factor" key={factor.label}>
              <span>{factor.label}</span>
              <span className="factor-track">
                <span style={{ width: `${factor.value}%` }} />
              </span>
              <strong>{factor.impact}</strong>
            </div>
          ))}
          <p className="muted">
            {locale === "zh"
              ? "当前使用规则化贡献解释；配置树模型后可切换为 SHAP。"
              : "Current explanations use bounded rule contributions; SHAP is enabled when tree models are configured."}
          </p>
        </div>
        <div className="card card-pad">
          <h2>{locale === "zh" ? "不确定性与数据质量" : "Uncertainty and data quality"}</h2>
          <p>
            {locale === "zh"
              ? "集成模型对主胜概率的示例 80% 区间为 ±5.8 个百分点。模型间分歧中等，阵容尚未确认。"
              : "The illustrative 80% interval around the home-win probability is ±5.8 percentage points. Model disagreement is moderate and lineups are unconfirmed."}
          </p>
          <div className="notice">
            {locale === "zh"
              ? "概率不是确定结果。比赛中的红牌、伤病和随机性可能显著改变赛果。"
              : "Probabilities are not certainties. Red cards, injuries, and match randomness can materially change the outcome."}
          </div>
        </div>
      </section>
    </main>
  );
}

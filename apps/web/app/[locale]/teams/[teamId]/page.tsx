import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { advancement, getTeam, matches } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";
import { MatchCard } from "@/components/match-card";

export default async function TeamPage({ params }: { params: Promise<{ locale: string; teamId: string }> }) {
  const { locale: rawLocale, teamId } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  let team;
  try {
    team = getTeam(teamId);
  } catch {
    notFound();
  }
  const path = advancement.find((item) => item.teamId === team.id);
  const fixtures = matches.filter((match) => match.homeTeamId === team.id || match.awayTeamId === team.id);
  return (
    <main className="page">
      <div className="team">
        <span className="flag" style={{ width: 72, height: 72, fontSize: 38 }}>
          {team.flag}
        </span>
        <div>
          <p className="eyebrow">Group {team.group}</p>
          <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{team.name[locale]}</h1>
          <p className="muted">
            FIFA #{team.fifaRank} · Elo {team.elo} · {team.form}
          </p>
        </div>
      </div>
      {path ? (
        <section className="section card card-pad">
          <h2>{locale === "zh" ? "晋级路径" : "Progression path"}</h2>
          <div className="kpi-grid">
            <div className="kpi">
              R32<strong>{formatPercent(path.roundOf32, locale)}</strong>
            </div>
            <div className="kpi">
              QF<strong>{formatPercent(path.quarterFinal, locale)}</strong>
            </div>
            <div className="kpi">
              SF<strong>{formatPercent(path.semiFinal, locale)}</strong>
            </div>
            <div className="kpi">
              {locale === "zh" ? "决赛" : "Final"}
              <strong>{formatPercent(path.final, locale)}</strong>
            </div>
            <div className="kpi">
              {locale === "zh" ? "冠军" : "Champion"}
              <strong>{formatPercent(path.champion, locale)}</strong>
            </div>
          </div>
        </section>
      ) : null}
      <section className="section">
        <h2>{locale === "zh" ? "相关比赛" : "Related matches"}</h2>
        <div className="grid grid-2">
          {fixtures.map((match) => (
            <MatchCard key={match.id} match={match} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}

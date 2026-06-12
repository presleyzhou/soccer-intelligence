import { advancement, teams } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function TeamPage({ params }: { params: Promise<{ locale: string; teamId: string }> }) {
  const { locale, teamId } = await params; if (!isLocale(locale)) notFound();
  const team = teams.find(item => item.id === teamId); if (!team) notFound();
  const row = advancement.find(item => item.teamId === teamId);
  return <main className="container"><header className="page-head"><div className="flag">{team.flag}</div><h1>{team.name[locale]}</h1><p className="lead">FIFA #{team.fifaRank} · Elo {team.elo} · Form {team.form}</p></header><div className="grid two"><section className="card"><h2>{locale === "zh" ? "球队实力" : "Team strength"}</h2><div className="metric-grid"><div className="metric"><strong>{team.elo}</strong><span className="muted tiny">Elo</span></div><div className="metric"><strong>#{team.fifaRank}</strong><span className="muted tiny">FIFA</span></div><div className="metric"><strong>{team.form}</strong><span className="muted tiny">Form</span></div></div></section><section className="card"><h2>{locale === "zh" ? "赛事概率" : "Tournament probability"}</h2>{row ? <div className="metric-grid"><div className="metric"><strong>{formatPercent(row.roundOf32,locale)}</strong><span className="muted tiny">R32</span></div><div className="metric"><strong>{formatPercent(row.semiFinal,locale)}</strong><span className="muted tiny">SF</span></div><div className="metric"><strong>{formatPercent(row.champion,locale)}</strong><span className="muted tiny">Champion</span></div></div> : null}</section></div></main>;
}

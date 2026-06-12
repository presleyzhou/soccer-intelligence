import { advancement, getTeam } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function Bracket({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const leaders = advancement.slice().sort((a,b) => b.champion-a.champion);
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "淘汰赛路径" : "Knockout pathways"}</h1><p className="lead">{locale === "zh" ? "展示每支球队到达各轮的边际概率。" : "Marginal probability of each team reaching every round."}</p></header><section className="card"><table className="table"><thead><tr><th>Team</th><th>R32</th><th>QF</th><th>SF</th><th>Final</th><th>Champion</th></tr></thead><tbody>{leaders.map(row => { const t=getTeam(row.teamId); return <tr key={row.teamId}><td>{t.flag} {t.name[locale]}</td><td>{formatPercent(row.roundOf32,locale)}</td><td>{formatPercent(row.quarterFinal,locale)}</td><td>{formatPercent(row.semiFinal,locale)}</td><td>{formatPercent(row.final,locale)}</td><td><strong>{formatPercent(row.champion,locale)}</strong></td></tr>})}</tbody></table></section></main>;
}

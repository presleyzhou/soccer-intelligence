import { matches, getTeam } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function Markets({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "模型与市场" : "Model vs markets"}</h1><p className="lead">{locale === "zh" ? "市场概率经过水位、流动性、价差和时间衰减处理，不被视为真实概率。" : "Market probabilities are adjusted for margin, liquidity, spread, and age; they are not treated as truth."}</p></header><section className="card"><table className="table"><thead><tr><th>Match</th><th>Model home</th><th>Market home</th><th>Edge</th><th>Status</th></tr></thead><tbody>{matches.map(match => { const home=getTeam(match.homeTeamId), away=getTeam(match.awayTeamId); const market=match.prediction.models.find(m=>m.model==="Market consensus")?.home ?? match.prediction.home; return <tr key={match.id}><td>{home.name[locale]} – {away.name[locale]}</td><td>{formatPercent(match.prediction.home,locale)}</td><td>{formatPercent(market,locale)}</td><td>{formatPercent(match.prediction.home-market,locale)}</td><td><span className="source-chip">Mock / adapter ready</span></td></tr>})}</tbody></table></section></main>;
}

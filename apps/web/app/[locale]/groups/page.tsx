import { advancement, getTeam } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function Groups({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "小组与出线概率" : "Groups and qualification"}</h1></header><section className="card"><table className="table"><thead><tr><th>{locale === "zh" ? "球队" : "Team"}</th><th>{locale === "zh" ? "小组" : "Group"}</th><th>{locale === "zh" ? "32 强" : "R32"}</th><th>{locale === "zh" ? "16 强" : "R16"}</th></tr></thead><tbody>{advancement.map((row) => { const team = getTeam(row.teamId); return <tr key={row.teamId}><td>{team.flag} {team.name[locale]}</td><td>{team.group}</td><td>{formatPercent(row.roundOf32, locale)}</td><td>{formatPercent(row.roundOf16, locale)}</td></tr>; })}</tbody></table></section></main>;
}

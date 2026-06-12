import Link from "next/link";
import { teams } from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function Teams({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "国家队实力" : "National teams"}</h1></header><div className="grid three">{teams.map(team => <Link className="card" href={`/${locale}/teams/${team.id}`} key={team.id}><div className="team-row"><span className="flag">{team.flag}</span><div><div className="team-name">{team.name[locale]}</div><div className="team-meta">FIFA #{team.fifaRank} · Elo {team.elo} · {team.form}</div></div></div></Link>)}</div></main>;
}

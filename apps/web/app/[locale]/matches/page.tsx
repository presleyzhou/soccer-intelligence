import { MatchRow } from "@/components/match-card";
import { matches } from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><div className="eyebrow">MATCH CENTRE</div><h1>{locale === "zh" ? "比赛预测" : "Match forecasts"}</h1><p className="lead">{locale === "zh" ? "所有概率均保存模型版本、生成时间和来源快照。" : "Every probability retains its model version, generation time, and source snapshot."}</p></header><div className="match-list">{matches.map((match) => <MatchRow key={match.id} match={match} locale={locale} />)}</div></main>;
}

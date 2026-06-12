import { TournamentSimulator } from "@/components/tournament-simulator";
import { advancement, teams } from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function TournamentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><div className="eyebrow">48 TEAMS · 12 GROUPS · ROUND OF 32</div><h1>{locale === "zh" ? "世界杯情景模拟器" : "World Cup scenario simulator"}</h1><p className="lead">{locale === "zh" ? "赛制版本化处理最佳第三名、32 强组合映射、加时与点球。" : "A versioned format engine handles best third-place teams, round-of-32 mapping, extra time, and penalties."}</p></header><TournamentSimulator teams={teams} baseline={advancement} locale={locale} /></main>;
}

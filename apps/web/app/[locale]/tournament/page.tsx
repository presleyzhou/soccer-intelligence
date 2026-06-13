import { notFound } from "next/navigation";
import { TournamentSimulator } from "@/components/tournament-simulator";
import { isLocale } from "@/lib/i18n";

export default async function TournamentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <div className="eyebrow">48 TEAMS · 12 GROUPS · ROUND OF 32</div>
        <h1>{locale === "zh" ? "世界杯模拟器" : "World Cup simulator"}</h1>
        <p className="lead">
          {locale === "zh"
            ? "结合实时赛果、注明时间的 Elo 实力与比分分布，估计每支球队的完整晋级路径。"
            : "Estimate every team's path using live results, timestamped Elo strength, and score distributions."}
        </p>
      </header>
      <TournamentSimulator locale={locale} />
    </main>
  );
}

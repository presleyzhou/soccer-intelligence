import { notFound } from "next/navigation";
import { LiveMatchCentre } from "@/components/live-match-centre";
import { isLocale } from "@/lib/i18n";

export default async function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <div className="eyebrow">LIVE MATCH CENTRE</div>
        <h1>{locale === "zh" ? "世界杯实时赛程" : "Live World Cup fixtures"}</h1>
        <p className="lead">
          {locale === "zh"
            ? "展示真实赛程、比分和状态；研究型比赛概率在首页独立展示，并明确注明模型与数据时间。"
            : "Real fixtures, scores, and status. Research match probabilities appear separately on the dashboard with model and data timestamps."}
        </p>
      </header>
      <LiveMatchCentre locale={locale} />
    </main>
  );
}

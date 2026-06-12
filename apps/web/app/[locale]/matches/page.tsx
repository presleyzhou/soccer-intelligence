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
            ? "展示真实赛程、比分和状态。未发布的模型概率不会用模拟值替代。"
            : "Real fixtures, scores, and status. Unpublished model probabilities are never replaced with simulated values."}
        </p>
      </header>
      <LiveMatchCentre locale={locale} />
    </main>
  );
}

import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { matches } from "@/lib/data";
import { isLocale } from "@/lib/i18n";

export default async function PredictionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <p className="eyebrow">{locale === "zh" ? "当前发布版本" : "Current release"}</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{locale === "zh" ? "全部预测" : "All predictions"}</h1>
      <div className="grid grid-2 section">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} locale={locale} />
        ))}
      </div>
    </main>
  );
}

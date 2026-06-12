import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { matches } from "@/lib/data";
import { isLocale } from "@/lib/i18n";

export default async function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <div className="section-head">
        <div>
          <p className="eyebrow">{locale === "zh" ? "比赛中心" : "Match centre"}</p>
          <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>
            {locale === "zh" ? "国际比赛预测" : "International forecasts"}
          </h1>
          <p className="muted">
            {locale === "zh"
              ? "所有时间自动按用户本地时区显示。"
              : "All kickoffs are formatted in the user's local timezone."}
          </p>
        </div>
      </div>
      <div className="grid grid-2">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} locale={locale} />
        ))}
      </div>
    </main>
  );
}

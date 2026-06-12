import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function BracketPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const rounds =
    locale === "zh"
      ? ["32 强", "16 强", "四分之一决赛", "半决赛", "决赛"]
      : ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];
  return (
    <main className="page">
      <p className="eyebrow">Format version: FIFA-WC-2026</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{locale === "zh" ? "淘汰赛路径" : "Knockout bracket"}</h1>
      <div className="bracket section">
        {rounds.map((round, index) => (
          <div className="bracket-column" key={round}>
            <h3>{round}</h3>
            {Array.from({ length: Math.max(1, 5 - index) }, (_, matchIndex) => (
              <div className="bracket-match" key={matchIndex}>
                <strong>Match {73 + index * 8 + matchIndex}</strong>
                <p className="muted">
                  {locale === "zh"
                    ? "由小组排名和最佳第三名组合决定"
                    : "Allocated from group finish and best-third matrix"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

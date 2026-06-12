import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { TournamentSimulator } from "@/components/tournament-simulator";
import { isLocale } from "@/lib/i18n";

export default async function TournamentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <p className="eyebrow">2026 · 48 teams · 12 groups</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{locale === "zh" ? "世界杯模拟器" : "World Cup simulator"}</h1>
      <p className="lead" style={{ color: "var(--muted)" }}>
        {locale === "zh"
          ? "赛制版本化支持 12 个小组、最佳第三名和 32 强组合映射。"
          : "Versioned rules support 12 groups, best third-place teams, and the Round-of-32 allocation matrix."}
      </p>
      <TournamentSimulator locale={locale} />
      <section className="section card card-pad">
        <h2>{locale === "zh" ? "淘汰赛路径预览" : "Knockout path preview"}</h2>
        <div className="bracket">
          {["Round of 32", "Round of 16", "Quarter-finals", "Final"].map((round, roundIndex) => (
            <div className="bracket-column" key={round}>
              <strong>{round}</strong>
              {Array.from({ length: Math.max(1, 4 - roundIndex) }, (_, index) => (
                <div className="bracket-match" key={index}>
                  <span className="muted">
                    {locale === "zh" ? "路径由小组排名决定" : "Path determined by group finish"}
                  </span>
                  <div>
                    Seed {roundIndex + 1}.{index + 1}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

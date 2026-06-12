import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { advancement, getTeam, teams } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";

export default async function GroupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const groups = [...new Set(teams.map((team) => team.group))].sort();
  return (
    <main className="page">
      <p className="eyebrow">12 groups · best third-place allocation</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>
        {locale === "zh" ? "小组与出线概率" : "Groups and qualification"}
      </h1>
      <div className="grid grid-3 section">
        {groups.map((group) => (
          <section className="card card-pad" key={group}>
            <h2>Group {group}</h2>
            <div className="rank-list">
              {teams
                .filter((team) => team.group === group)
                .map((team) => {
                  const probability = advancement.find((item) => item.teamId === team.id)?.roundOf32 ?? 0.42;
                  return (
                    <div className="source-row" key={team.id}>
                      <span>
                        {team.flag} {getTeam(team.id).name[locale]}
                      </span>
                      <strong>{formatPercent(probability, locale)}</strong>
                    </div>
                  );
                })}
              <p className="muted">
                {locale === "zh"
                  ? "其余席位由赛程 Provider 配置后显示。"
                  : "Remaining slots appear when the fixture provider is configured."}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

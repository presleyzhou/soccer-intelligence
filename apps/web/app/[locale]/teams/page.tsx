import type { Locale } from "@wci/contracts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teams } from "@/lib/data";
import { isLocale } from "@/lib/i18n";

export default async function TeamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <p className="eyebrow">{locale === "zh" ? "球队实力" : "Team strength"}</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{locale === "zh" ? "国家队" : "National teams"}</h1>
      <div className="grid grid-3 section">
        {teams.map((team) => (
          <Link className="card card-pad" href={`/${locale}/teams/${team.id}`} key={team.id}>
            <div className="team">
              <span className="flag">{team.flag}</span>
              <div>
                <h2>{team.name[locale]}</h2>
                <p className="muted">
                  FIFA #{team.fifaRank} · Elo {team.elo} · {team.form}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

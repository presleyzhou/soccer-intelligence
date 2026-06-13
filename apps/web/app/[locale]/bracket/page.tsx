import { notFound } from "next/navigation";
import { TournamentSimulator } from "@/components/tournament-simulator";
import { isLocale } from "@/lib/i18n";
export default async function Bracket({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "淘汰赛路径" : "Knockout pathways"}</h1>
      </header>
      <TournamentSimulator locale={locale} view="bracket" />
    </main>
  );
}

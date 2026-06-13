import { notFound } from "next/navigation";
import { TournamentSimulator } from "@/components/tournament-simulator";
import { isLocale } from "@/lib/i18n";
export default async function Groups({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "小组与出线概率" : "Groups and qualification"}</h1>
      </header>
      <TournamentSimulator locale={locale} view="groups" />
    </main>
  );
}

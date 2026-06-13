import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

const sources = [
  {
    name: "ESPN public scoreboard",
    status: "live",
    purpose: "Browser-side FIFA World Cup fixtures, scores and match status",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"
  },
  {
    name: "World Football Elo Ratings",
    status: "daily snapshot",
    purpose: "Timestamped national-team strength inputs for match forecasts",
    url: "https://www.eloratings.net/World"
  },
  {
    name: "TheSportsDB",
    status: "server adapter",
    purpose: "Optional server-side FIFA World Cup fixture provider",
    url: "https://www.thesportsdb.com/documentation"
  },
  {
    name: "Polymarket Gamma API",
    status: "live",
    purpose: "Public read-only prediction-market prices, volume and liquidity",
    url: "https://docs.polymarket.com/developers/gamma-markets-api/overview"
  },
  {
    name: "Open-Meteo",
    status: "adapter-ready",
    purpose: "Weather forecasts after verified venue coordinates are available",
    url: "https://open-meteo.com/"
  }
];

export default async function Sources({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "数据来源" : "Data sources"}</h1>
        <p className="lead">
          {locale === "zh"
            ? "只列出当前实际使用或已准备接入的合法公开数据源。"
            : "Only lawful public sources currently used or ready for integration are listed."}
        </p>
      </header>
      <div className="grid two">
        {sources.map((source) => (
          <section className="card" key={source.name}>
            <div className="eyebrow">{source.status}</div>
            <h2>{source.name}</h2>
            <p className="muted">{source.purpose}</p>
            <a className="button" href={source.url} target="_blank" rel="noreferrer">
              {locale === "zh" ? "查看文档" : "Documentation"}
            </a>
          </section>
        ))}
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Teams({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "国家队数据" : "National team data"}</h1></header><section className="card empty-state"><h2>{locale === "zh" ? "评级数据正在接入" : "Ratings feed in progress"}</h2><p className="muted">{locale === "zh" ? "FIFA 排名、Elo 和阵容数据只有在来源日期可验证时才会展示。" : "FIFA rankings, Elo, and squad data will display only with verifiable source dates."}</p></section></main>;
}

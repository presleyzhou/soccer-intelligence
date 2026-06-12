import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Bracket({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "淘汰赛路径" : "Knockout pathways"}</h1></header><section className="card empty-state"><h2>{locale === "zh" ? "路径概率尚未发布" : "Path probabilities not published"}</h2><p className="muted">{locale === "zh" ? "本站不会基于模拟球队或虚构抽签路径输出概率。" : "The site does not publish probabilities from simulated teams or invented bracket paths."}</p></section></main>;
}

import { ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function TournamentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <div className="eyebrow">48 TEAMS · 12 GROUPS · ROUND OF 32</div>
        <h1>{locale === "zh" ? "世界杯模拟器" : "World Cup simulator"}</h1>
      </header>
      <section className="card empty-state">
        <ShieldAlert size={28} color="var(--gold)" />
        <h2>{locale === "zh" ? "模拟暂未发布" : "Simulation not yet published"}</h2>
        <p className="muted">
          {locale === "zh"
            ? "在球队实力、真实赛前特征和校准模型准备完成前，本站不会生成虚构的晋级或冠军概率。"
            : "No advancement or champion probabilities are generated until team strength, real pre-match features, and a calibrated model are production-ready."}
        </p>
      </section>
    </main>
  );
}

import { DatabaseZap, ShieldCheck, TimerReset } from "lucide-react";
import { notFound } from "next/navigation";
import { LiveMatchCentre } from "@/components/live-match-centre";
import { getCopy, isLocale } from "@/lib/i18n";

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCopy(locale);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">SOCCER INTELLIGENCE · FIFA WORLD CUP 2026</div>
          <h1>{copy.tagline}</h1>
          <p className="lead">
            {locale === "zh"
              ? "赛程、比分和比赛状态使用公开实时数据。胜平负、晋级和冠军概率只有在真实输入、时间外验证和概率校准全部通过后才会发布。"
              : "Fixtures, scores, and match status use a public live feed. Win, advancement, and champion probabilities publish only after real inputs, out-of-time validation, and calibration all pass."}
          </p>
          <span className="notice">{copy.simulated}</span>
        </div>
      </section>

      <div className="container grid dashboard-grid">
        <LiveMatchCentre locale={locale} compact />
        <aside className="grid">
          <section className="card soft">
            <ShieldCheck color="var(--accent)" />
            <h2>{locale === "zh" ? "模型发布状态" : "Forecast publication status"}</h2>
            <p className="muted">
              {locale === "zh"
                ? "尚未发布。当前没有满足真实赛前特征、滚动样本外验证和校准要求的生产模型版本。"
                : "Not published. No production model version currently satisfies real pre-match features, rolling out-of-time validation, and calibration requirements."}
            </p>
          </section>
          <section className="card soft">
            <DatabaseZap color="var(--accent)" />
            <h2>{locale === "zh" ? "实时事实源" : "Live fact source"}</h2>
            <p className="muted">TheSportsDB · FIFA World Cup league 4429</p>
            <span className="source-chip"><span className="status-dot" /> live · 60s refresh</span>
          </section>
          <section className="card soft">
            <TimerReset color="var(--gold)" />
            <h2>{locale === "zh" ? "故障策略" : "Failure policy"}</h2>
            <p className="muted">
              {locale === "zh"
                ? "实时源不可用时显示暂无数据，不自动回退到虚构比赛或概率。"
                : "If the live provider fails, the site shows unavailable data instead of invented fixtures or probabilities."}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

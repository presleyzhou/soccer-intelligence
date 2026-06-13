import Image from "next/image";
import { notFound } from "next/navigation";
import { LiveMatchCentre } from "@/components/live-match-centre";
import { MatchPredictionPanel } from "@/components/match-prediction-panel";
import { getCopy, isLocale } from "@/lib/i18n";

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCopy(locale);

  return (
    <main>
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <div className="eyebrow">SOCCER INTELLIGENCE · FIFA WORLD CUP 2026</div>
            <h1>{copy.tagline}</h1>
            <p className="lead">
              {locale === "zh"
                ? "赛程、比分和比赛状态使用公开实时数据。右侧比赛预测融合 Elo、Poisson 和 Dixon-Coles，并完整公开输入时间与模型差异。"
                : "Fixtures, scores, and match status use a public live feed. Match forecasts combine Elo, Poisson, and Dixon-Coles with input timestamps and model differences disclosed."}
            </p>
            <span className="notice">{copy.simulated}</span>
          </div>
          <div className="hero-football" aria-hidden="true">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/world-cup-data-ball.webp`}
              alt=""
              width={627}
              height={627}
              priority
            />
          </div>
        </div>
      </section>

      <div className="container grid dashboard-grid">
        <LiveMatchCentre locale={locale} compact />
        <MatchPredictionPanel locale={locale} />
      </div>
    </main>
  );
}

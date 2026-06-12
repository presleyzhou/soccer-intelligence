import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/info-page";
import { isLocale } from "@/lib/i18n";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <InfoPage
      locale={locale}
      eyebrow="World Cup Intelligence"
      title={locale === "zh" ? "关于项目" : "About the project"}
      description={
        locale === "zh"
          ? "一个可审计、可扩展的国际足球概率平台。"
          : "An auditable, extensible probability platform for international football."
      }
      sections={[
        {
          title: locale === "zh" ? "使命" : "Mission",
          body:
            locale === "zh"
              ? "让用户看见概率、模型分歧、数据来源和不确定性，而不是神秘的单一结论。"
              : "Expose probabilities, model disagreement, sources, and uncertainty instead of a mysterious single answer."
        },
        {
          title: locale === "zh" ? "非官方" : "Independent",
          body:
            locale === "zh"
              ? "本项目与 FIFA 无隶属关系，不使用未经授权的官方商标或媒体素材。"
              : "This project is not affiliated with FIFA and does not use unauthorized official marks or media."
        }
      ]}
    />
  );
}

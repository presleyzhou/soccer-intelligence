import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/info-page";
import { isLocale } from "@/lib/i18n";

export default async function DisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <InfoPage
      locale={locale}
      eyebrow="Legal and risk"
      title={locale === "zh" ? "免责声明" : "Disclaimer"}
      description={
        locale === "zh"
          ? "所有输出都是存在误差和延迟的概率估计。"
          : "All outputs are probabilistic estimates subject to error and delay."
      }
      sections={[
        {
          title: locale === "zh" ? "不是建议" : "Not advice",
          body:
            locale === "zh"
              ? "不构成博彩、金融、投资或法律建议，不保证准确或盈利。"
              : "Not betting, financial, investment, or legal advice; no accuracy or profit is guaranteed."
        },
        {
          title: locale === "zh" ? "地区与年龄" : "Region and age",
          body:
            locale === "zh"
              ? "用户必须达到当地法定年龄，并遵守其所在地与市场平台的法律和条款。"
              : "Users must meet local age requirements and comply with applicable laws and platform terms."
        },
        {
          title: locale === "zh" ? "数据延迟" : "Data delays",
          body:
            locale === "zh"
              ? "赔率、预测市场、新闻和伤停数据可能延迟、错误或随后被修正。"
              : "Odds, market, news, and injury data may be delayed, incorrect, or later revised."
        },
        {
          title: locale === "zh" ? "知识产权" : "Intellectual property",
          body:
            locale === "zh"
              ? "本网站不是 FIFA 官方网站。FIFA 及相关标志属于其权利人。"
              : "This is not an official FIFA website. FIFA and related marks belong to their respective owners."
        }
      ]}
    />
  );
}

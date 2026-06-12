import type { Locale } from "@wci/contracts";
import Link from "next/link";
import { getCopy } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <footer className="footer">
      <p>{t.disclaimer}</p>
      <p>
        {locale === "zh"
          ? "本网站不是 FIFA 官方网站，未使用未经授权的 FIFA 标志。用户应遵守所在地区法律，市场数据可能延迟。"
          : "This is not an official FIFA website and does not use unauthorized FIFA marks. Users must follow local laws; market data may be delayed."}
      </p>
      <Link href={`/${locale}/disclaimer`}>{locale === "zh" ? "完整免责声明" : "Full disclaimer"}</Link>
    </footer>
  );
}

import { Activity } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@wci/contracts";
import { getCopy } from "@/lib/i18n";
import { ThemeToggle } from "./theme-toggle";

export function Navigation({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const other = locale === "en" ? "zh" : "en";

  return (
    <header className="topbar">
      <Link className="brand" href={`/${locale}`}>
        <span className="brand-mark">
          <Activity size={19} />
        </span>
        <span>{t.brand}</span>
      </Link>
      <nav className="nav" aria-label="Primary navigation">
        <Link href={`/${locale}`}>{t.nav.dashboard}</Link>
        <Link href={`/${locale}/matches`}>{t.nav.matches}</Link>
        <Link href={`/${locale}/tournament`}>{t.nav.tournament}</Link>
        <Link href={`/${locale}/markets`}>{t.nav.markets}</Link>
        <Link href={`/${locale}/methodology`}>{t.nav.methodology}</Link>
        <Link href={`/${locale}/backtest`}>{t.nav.backtest}</Link>
      </nav>
      <div className="toolbar">
        <Link className="pill-button" href={`/${other}`}>
          {other === "zh" ? "中文" : "EN"}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

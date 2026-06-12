import { Globe2, Trophy } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@wci/contracts";
import { getCopy } from "@/lib/i18n";
import { ThemeToggle } from "./theme-toggle";

export function Header({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const other = locale === "en" ? "zh" : "en";
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} className="brand">
          <span className="brand-mark"><Trophy size={20} /></span>
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
        <div className="header-actions">
          <ThemeToggle />
          <Link className="pill" href={`/${other}`} aria-label="Change language">
            <Globe2 size={15} /> {other.toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}

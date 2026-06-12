import type { Locale } from "@wci/contracts";
import { formatPercent, getCopy } from "@/lib/i18n";

export function ProbabilityBar({
  home,
  draw,
  away,
  locale
}: {
  home: number;
  draw: number;
  away: number;
  locale: Locale;
}) {
  const t = getCopy(locale);
  return (
    <div>
      <div
        className="probability-bar"
        aria-label={`${t.home} ${formatPercent(home, locale)}, ${t.draw} ${formatPercent(draw, locale)}, ${t.away} ${formatPercent(away, locale)}`}
      >
        <span className="probability-home" style={{ width: `${home * 100}%` }} />
        <span className="probability-draw" style={{ width: `${draw * 100}%` }} />
        <span className="probability-away" style={{ width: `${away * 100}%` }} />
      </div>
      <div className="probability-labels">
        <div>
          <strong>{formatPercent(home, locale)}</strong>
          <span>{t.home}</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <strong>{formatPercent(draw, locale)}</strong>
          <span>{t.draw}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>{formatPercent(away, locale)}</strong>
          <span>{t.away}</span>
        </div>
      </div>
    </div>
  );
}

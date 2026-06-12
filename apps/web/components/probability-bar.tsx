import type { Locale } from "@wci/contracts";
import { formatPercent, getCopy } from "@/lib/i18n";

export function ProbabilityBar({ values, locale }: { values: [number, number, number]; locale: Locale }) {
  const t = getCopy(locale);
  const labels = [t.home, t.draw, t.away];
  return (
    <div className="probability-grid">
      {values.map((value, index) => (
        <div className="prob-box" key={labels[index]}>
          <span className="muted tiny">{labels[index]}</span>
          <strong>{formatPercent(value, locale)}</strong>
          <div className="prob-bar"><div className="prob-fill" style={{ width: `${value * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

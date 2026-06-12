import Link from "next/link";
import type { Locale, Match } from "@wci/contracts";
import { formatDate, formatPercent } from "@/lib/i18n";
import { getTeam } from "@/lib/data";

export function MatchRow({ match, locale }: { match: Match; locale: Locale }) {
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  return (
    <Link href={`/${locale}/matches/${match.id}`} className="match-row">
      <div><strong>{formatDate(match.kickoffAt, locale)}</strong><div className="tiny muted">{match.city[locale]}</div></div>
      <div className="team-row"><span className="flag">{home.flag}</span><div><div className="team-name">{home.name[locale]}</div><div className="team-meta">Elo {home.elo}</div></div></div>
      <div className="team-row"><span className="flag">{away.flag}</span><div><div className="team-name">{away.name[locale]}</div><div className="team-meta">Elo {away.elo}</div></div></div>
      <div className="mini-probs">
        <span>{formatPercent(match.prediction.home, locale)}</span>
        <span>{formatPercent(match.prediction.draw, locale)}</span>
        <span>{formatPercent(match.prediction.away, locale)}</span>
      </div>
    </Link>
  );
}

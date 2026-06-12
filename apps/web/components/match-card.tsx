import type { Locale, Match } from "@wci/contracts";
import Link from "next/link";
import { Clock3, MapPin, Radio } from "lucide-react";
import { formatDate, formatPercent, getCopy } from "@/lib/i18n";
import { getTeam } from "@/lib/data";
import { ProbabilityBar } from "./probability-bar";

export function MatchCard({ match, locale, featured = false }: { match: Match; locale: Locale; featured?: boolean }) {
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const likely = match.prediction.scorelines[0];
  const t = getCopy(locale);

  return (
    <Link className="card match-card" href={`/${locale}/matches/${match.id}`}>
      <div className="match-meta">
        <span>
          <Clock3 size={13} /> {formatDate(match.kickoffAt, locale)}
        </span>
        <span>
          <Radio size={13} /> {locale === "zh" ? "关注度" : "Attention"} {match.attention}
        </span>
      </div>
      <div className="team-pair">
        <div className="team">
          <span className="flag">{home.flag}</span>
          <div>
            <strong>{home.name[locale]}</strong>
            <div className="muted">Elo {home.elo}</div>
          </div>
        </div>
        <span className="versus">VS</span>
        <div className="team away">
          <div>
            <strong>{away.name[locale]}</strong>
            <div className="muted">Elo {away.elo}</div>
          </div>
          <span className="flag">{away.flag}</span>
        </div>
      </div>
      <ProbabilityBar {...match.prediction} locale={locale} />
      <div className="match-meta">
        <span>
          <MapPin size={13} /> {match.venue[locale]}, {match.city[locale]}
        </span>
        {likely ? (
          <span className="score-chip">
            {t.likelyScore}:{" "}
            <strong>
              {likely.home}-{likely.away}
            </strong>{" "}
            ({formatPercent(likely.probability, locale)})
          </span>
        ) : null}
      </div>
      {featured ? (
        <span className="status-chip live">{locale === "zh" ? "集成模型 v0.1" : "Ensemble model v0.1"}</span>
      ) : null}
    </Link>
  );
}

import type { Locale } from "@wci/contracts";
import { advancement, getTeam } from "@/lib/data";
import { formatPercent } from "@/lib/i18n";

export function ChampionList({ locale, limit = 8 }: { locale: Locale; limit?: number }) {
  return (
    <div className="rank-list">
      {[...advancement]
        .sort((a, b) => b.champion - a.champion)
        .slice(0, limit)
        .map((item, index) => {
          const team = getTeam(item.teamId);
          return (
            <div className="rank-row" key={item.teamId}>
              <span className="muted">{index + 1}</span>
              <span>
                {team.flag} <strong>{team.name[locale]}</strong>
              </span>
              <span className="mini-bar">
                <span style={{ width: `${(item.champion * 100) / 0.16}%` }} />
              </span>
              <strong>{formatPercent(item.champion, locale)}</strong>
            </div>
          );
        })}
    </div>
  );
}

"use client";

import { Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import type { Locale } from "@wci/contracts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorldCupDates, type SportsDbEvent, utcDateWithOffset } from "@/lib/client-football-data";
type LoadState = "loading" | "live" | "error";

function datesAroundToday(daysBefore: number, daysAfter: number): string[] {
  return Array.from({ length: daysBefore + daysAfter + 1 }, (_, index) => utcDateWithOffset(index - daysBefore));
}

function formatKickoff(value: string | null, locale: Locale): string {
  if (!value) return locale === "zh" ? "时间待确认" : "Time TBC";
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(`${value}Z`));
}

function statusText(event: SportsDbEvent, locale: Locale): string {
  if (event.strStatus === "FT") return locale === "zh" ? "完场" : "Full time";
  if (event.strStatus === "HT") return locale === "zh" ? "半场" : "Half time";
  if (event.strStatus) return locale === "zh" ? "进行中" : "Live";
  return locale === "zh" ? "未开赛" : "Scheduled";
}

export function LiveMatchCentre({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const [events, setEvents] = useState<SportsDbEvent[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [updatedAt, setUpdatedAt] = useState<string>();

  const load = useCallback(async () => {
    setState((current) => (current === "live" ? current : "loading"));
    try {
      const dates = datesAroundToday(compact ? 1 : 2, compact ? 3 : 5);
      setEvents(await fetchWorldCupDates(dates));
      setUpdatedAt(new Date().toISOString());
      setState("live");
    } catch {
      setState("error");
    }
  }, [compact]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const visibleEvents = useMemo(() => (compact ? events.slice(0, 6) : events), [compact, events]);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <div className="eyebrow">FIFA WORLD CUP 2026 · LIVE FACTS</div>
          <h2>{locale === "zh" ? "实时赛程与比分" : "Live fixtures and scores"}</h2>
        </div>
        <button className="pill" type="button" onClick={() => void load()} aria-label="Refresh live data">
          <RefreshCw size={15} /> {state}
        </button>
      </div>
      <div className="notice live-notice">
        <ShieldCheck size={15} />
        {locale === "zh"
          ? "赛程、比分和比赛状态来自 ESPN 世界杯公共数据源，每 60 秒刷新。预测使用独立注明时间的 Elo 输入。"
          : "Fixtures, scores, and status come from ESPN's public World Cup feed and refresh every 60 seconds. Forecasts use a separate timestamped Elo input."}
      </div>
      {state === "loading" ? (
        <p className="muted">{locale === "zh" ? "正在载入实时数据…" : "Loading live data..."}</p>
      ) : null}
      {state === "error" ? (
        <div className="empty-state">
          <strong>{locale === "zh" ? "实时数据暂不可用" : "Live data temporarily unavailable"}</strong>
          <p className="muted">
            {locale === "zh"
              ? "系统不会使用模拟比赛替代。请稍后刷新。"
              : "Simulated matches will not be substituted. Please refresh shortly."}
          </p>
        </div>
      ) : null}
      {state === "live" && visibleEvents.length === 0 ? (
        <div className="empty-state">
          <strong>{locale === "zh" ? "当前时间窗口没有世界杯比赛" : "No World Cup matches in this window"}</strong>
        </div>
      ) : null}
      <div className="live-match-list">
        {visibleEvents.map((event) => {
          const hasScore = event.intHomeScore !== null && event.intAwayScore !== null;
          return (
            <article className="live-match-row" key={event.idEvent}>
              <div>
                <strong>{formatKickoff(event.strTimestamp, locale)}</strong>
                <div className="tiny muted">
                  {event.strGroup ? `${locale === "zh" ? "小组" : "Group"} ${event.strGroup} · ` : ""}
                  {[event.strVenue, event.strCity ?? event.strCountry].filter(Boolean).join(", ")}
                </div>
              </div>
              <div className="live-team">
                {event.strHomeTeamBadge ? (
                  <span
                    className="live-team-badge"
                    style={{ backgroundImage: `url("${event.strHomeTeamBadge}")` }}
                    aria-hidden="true"
                  />
                ) : null}
                <strong>{event.strHomeTeam}</strong>
              </div>
              <div className="live-score">
                {hasScore ? `${event.intHomeScore} – ${event.intAwayScore}` : "vs"}
                <span>{statusText(event, locale)}</span>
              </div>
              <div className="live-team away">
                {event.strAwayTeamBadge ? (
                  <span
                    className="live-team-badge"
                    style={{ backgroundImage: `url("${event.strAwayTeamBadge}")` }}
                    aria-hidden="true"
                  />
                ) : null}
                <strong>{event.strAwayTeam}</strong>
              </div>
            </article>
          );
        })}
      </div>
      {updatedAt ? (
        <p className="tiny muted source-time">
          <Clock3 size={12} /> {locale === "zh" ? "获取时间" : "Fetched"}:{" "}
          {formatKickoff(updatedAt.slice(0, -1), locale)}
        </p>
      ) : null}
      <a
        className="tiny muted"
        href="https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"
        target="_blank"
        rel="noreferrer"
      >
        {locale === "zh" ? "数据源与 API 文档" : "Source and API documentation"} →
      </a>
    </section>
  );
}

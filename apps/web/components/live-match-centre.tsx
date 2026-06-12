"use client";

import { Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import type { Locale } from "@wci/contracts";
import { useCallback, useEffect, useMemo, useState } from "react";

type SportsDbEvent = {
  idEvent: string;
  strTimestamp: string | null;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string | null;
  strGroup: string | null;
  strVenue: string | null;
  strCity: string | null;
  strCountry: string | null;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
};

type SportsDbResponse = { events: SportsDbEvent[] | null };
type LoadState = "loading" | "live" | "error";

const API_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const WORLD_CUP_LEAGUE_ID = "4429";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function datesAroundToday(daysBefore: number, daysAfter: number): string[] {
  const today = new Date();
  return Array.from({ length: daysBefore + daysAfter + 1 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + index - daysBefore);
    return isoDate(date);
  });
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
  if (event.strStatus === "1H" || event.strStatus === "2H")
    return locale === "zh" ? "进行中" : "Live";
  return locale === "zh" ? "未开赛" : "Scheduled";
}

export function LiveMatchCentre({
  locale,
  compact = false
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const [events, setEvents] = useState<SportsDbEvent[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [updatedAt, setUpdatedAt] = useState<string>();

  const load = useCallback(async () => {
    setState((current) => (current === "live" ? current : "loading"));
    try {
      const dates = datesAroundToday(compact ? 1 : 2, compact ? 3 : 5);
      const payloads = await Promise.all(
        dates.map(async (date) => {
          const response = await fetch(
            `${API_BASE}/eventsday.php?d=${date}&l=${WORLD_CUP_LEAGUE_ID}`,
            { cache: "no-store" }
          );
          if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
          return (await response.json()) as SportsDbResponse;
        })
      );
      const unique = new Map<string, SportsDbEvent>();
      payloads.flatMap((payload) => payload.events ?? []).forEach((event) => unique.set(event.idEvent, event));
      setEvents(
        [...unique.values()].sort((left, right) =>
          (left.strTimestamp ?? "").localeCompare(right.strTimestamp ?? "")
        )
      );
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
          ? "赛程、比分和比赛状态来自 TheSportsDB 世界杯数据源，每 60 秒刷新。预测概率仅在真实模型通过发布门槛后显示。"
          : "Fixtures, scores, and status come from TheSportsDB's World Cup feed and refresh every 60 seconds. Forecast probabilities appear only after a real model clears publication gates."}
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
                    style={{ backgroundImage: `url("${event.strHomeTeamBadge}/tiny")` }}
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
                    style={{ backgroundImage: `url("${event.strAwayTeamBadge}/tiny")` }}
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
          <Clock3 size={12} /> {locale === "zh" ? "获取时间" : "Fetched"}: {formatKickoff(updatedAt.slice(0, -1), locale)}
        </p>
      ) : null}
      <a
        className="tiny muted"
        href="https://www.thesportsdb.com/documentation"
        target="_blank"
        rel="noreferrer"
      >
        {locale === "zh" ? "数据源与 API 文档" : "Source and API documentation"} →
      </a>
    </section>
  );
}

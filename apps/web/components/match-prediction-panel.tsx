"use client";

import { Activity, Clock3, RefreshCw } from "lucide-react";
import type { Locale } from "@wci/contracts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorldCupDates, type SportsDbEvent, utcDateWithOffset } from "@/lib/client-football-data";
import { predictMatch, type MatchPrediction, type OutcomeProbabilities } from "@/lib/prediction";

type EloSnapshot = {
  source: string;
  sourceUrl: string;
  namesUrl: string;
  fetchedAt: string;
  sourceLastModified: string | null;
  teams: Array<{ rank: number; code: string; rating: number; names: string[] }>;
};

type PredictionRow = {
  event: SportsDbEvent;
  homeRating: { rank: number; rating: number };
  awayRating: { rank: number; rating: number };
  prediction: MatchPrediction;
};

type LoadState = "loading" | "live" | "error";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const TEAM_CODE_OVERRIDES: Record<string, string> = {
  "bosnia-herzegovina": "BA",
  "cape-verde": "CV",
  "congo-dr": "CD",
  "czech-republic": "CZ",
  "ivory-coast": "CI",
  "south-korea": "KR",
  turkiye: "TR",
  usa: "US"
};

function normalizeTeamName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
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

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function modelRows(prediction: MatchPrediction): Array<{ name: string; probabilities: OutcomeProbabilities }> {
  return [
    { name: "Elo", probabilities: prediction.elo },
    { name: "Poisson", probabilities: prediction.poisson },
    { name: "Dixon-Coles", probabilities: prediction.dixonColes }
  ];
}

export function MatchPredictionPanel({ locale }: { locale: Locale }) {
  const [events, setEvents] = useState<SportsDbEvent[]>([]);
  const [snapshot, setSnapshot] = useState<EloSnapshot>();
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    setState((current) => (current === "live" ? current : "loading"));
    try {
      const dates = Array.from({ length: 7 }, (_, offset) => utcDateWithOffset(offset - 1));
      const [eloResponse, loadedEvents] = await Promise.all([
        fetch(`${BASE_PATH}/data/world-elo.json`, { cache: "no-store" }),
        fetchWorldCupDates(dates)
      ]);
      if (!eloResponse.ok) throw new Error("A prediction input is unavailable");
      const eloPayload = (await eloResponse.json()) as EloSnapshot;
      setEvents(
        loadedEvents
          .filter((event) => {
            if (!event.strTimestamp) return false;
            return (
              new Date(`${event.strTimestamp}Z`).getTime() > Date.now() &&
              !["FT", "AET", "PEN"].includes(event.strStatus ?? "")
            );
          })
          .sort((left, right) => (left.strTimestamp ?? "").localeCompare(right.strTimestamp ?? ""))
      );
      setSnapshot(eloPayload);
      setState("live");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const predictions = useMemo(() => {
    if (!snapshot) return [];
    const ratingsByCode = new Map(snapshot.teams.map((team) => [team.code, team]));
    const ratingsByName = new Map(
      snapshot.teams.flatMap((team) => team.names.map((name) => [normalizeTeamName(name), team] as const))
    );
    return events.flatMap((event): PredictionRow[] => {
      const homeName = normalizeTeamName(event.strHomeTeam);
      const awayName = normalizeTeamName(event.strAwayTeam);
      const homeOverride = TEAM_CODE_OVERRIDES[homeName];
      const awayOverride = TEAM_CODE_OVERRIDES[awayName];
      const homeRating = homeOverride ? ratingsByCode.get(homeOverride) : ratingsByName.get(homeName);
      const awayRating = awayOverride ? ratingsByCode.get(awayOverride) : ratingsByName.get(awayName);
      if (!homeRating || !awayRating) return [];
      return [
        {
          event,
          homeRating,
          awayRating,
          prediction: predictMatch(homeRating.rating, awayRating.rating)
        }
      ];
    });
  }, [events, snapshot]);

  return (
    <aside className="card prediction-panel">
      <div className="section-header">
        <div>
          <div className="eyebrow">MULTI-MODEL FORECAST</div>
          <h2>{locale === "zh" ? "比赛预测" : "Match predictions"}</h2>
        </div>
        <button
          className="pill"
          type="button"
          onClick={() => void load()}
          aria-label={locale === "zh" ? "刷新预测" : "Refresh predictions"}
        >
          <RefreshCw size={14} /> {state}
        </button>
      </div>
      <p className="tiny muted prediction-method">
        {locale === "zh"
          ? "Elo、Poisson 与 Dixon-Coles 等权集成。输入为实时赛程和注明时间的 Elo 快照，尚未经过本站滚动样本外校准。"
          : "Equal-weight Elo, Poisson, and Dixon-Coles ensemble using live fixtures and a timestamped Elo snapshot. Not yet rolling out-of-time calibrated by this site."}
      </p>
      {state === "loading" ? <p className="muted">{locale === "zh" ? "正在计算…" : "Calculating..."}</p> : null}
      {state === "error" ? (
        <div className="empty-state">
          <strong>{locale === "zh" ? "预测输入暂不可用" : "Prediction inputs unavailable"}</strong>
          <p className="muted">
            {locale === "zh" ? "系统不会使用虚构评级进行替代。" : "Invented ratings will not be substituted."}
          </p>
        </div>
      ) : null}
      {state === "live" && predictions.length === 0 ? (
        <div className="empty-state">
          <strong>{locale === "zh" ? "暂无可计算的未来比赛" : "No forecastable upcoming matches"}</strong>
        </div>
      ) : null}
      <div className="prediction-list">
        {predictions.slice(0, 5).map(({ event, homeRating, awayRating, prediction }) => (
          <article className="prediction-card" key={event.idEvent}>
            <div className="prediction-kickoff">
              <Clock3 size={12} />
              {formatKickoff(event.strTimestamp, locale)}
            </div>
            <div className="prediction-teams">
              <div>
                <strong>{event.strHomeTeam}</strong>
                <span>
                  Elo #{homeRating.rank} · {homeRating.rating}
                </span>
              </div>
              <div className="predicted-score" aria-label={locale === "zh" ? "最可能比分" : "Most likely score"}>
                {prediction.scoreline.home}:{prediction.scoreline.away}
                <span>{locale === "zh" ? "最可能" : "mode"}</span>
              </div>
              <div className="away">
                <strong>{event.strAwayTeam}</strong>
                <span>
                  Elo #{awayRating.rank} · {awayRating.rating}
                </span>
              </div>
            </div>
            <div className="prediction-probabilities">
              <span>
                {locale === "zh" ? "主胜" : "Home"} <strong>{percent(prediction.ensemble.home)}</strong>
              </span>
              <span>
                {locale === "zh" ? "平局" : "Draw"} <strong>{percent(prediction.ensemble.draw)}</strong>
              </span>
              <span>
                {locale === "zh" ? "客胜" : "Away"} <strong>{percent(prediction.ensemble.away)}</strong>
              </span>
            </div>
            <details className="model-breakdown">
              <summary>
                <Activity size={13} />
                {locale === "zh" ? "查看模型对比" : "Compare models"}
                <span>
                  {locale === "zh" ? "分歧" : "spread"} {percent(prediction.disagreement)}
                </span>
              </summary>
              <div className="model-table">
                <div className="model-table-head">
                  <span>{locale === "zh" ? "模型" : "Model"}</span>
                  <span>{locale === "zh" ? "主" : "H"}</span>
                  <span>{locale === "zh" ? "平" : "D"}</span>
                  <span>{locale === "zh" ? "客" : "A"}</span>
                </div>
                {modelRows(prediction).map((model) => (
                  <div className="model-table-row" key={model.name}>
                    <strong>{model.name}</strong>
                    <span>{percent(model.probabilities.home)}</span>
                    <span>{percent(model.probabilities.draw)}</span>
                    <span>{percent(model.probabilities.away)}</span>
                  </div>
                ))}
              </div>
              <p className="tiny muted">
                xG {prediction.expectedGoals.home.toFixed(2)}–{prediction.expectedGoals.away.toFixed(2)}
                {" · "}
                {locale === "zh"
                  ? `该比分概率 ${percent(prediction.scoreline.probability)}`
                  : `score probability ${percent(prediction.scoreline.probability)}`}
              </p>
            </details>
          </article>
        ))}
      </div>
      {snapshot ? (
        <p className="tiny muted source-time">
          {locale === "zh" ? "实力快照" : "Strength snapshot"}:{" "}
          {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
            dateStyle: "medium",
            timeStyle: "short"
          }).format(new Date(snapshot.fetchedAt))}
          {" · "}
          <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">
            {snapshot.source}
          </a>
        </p>
      ) : null}
      <p className="tiny muted">
        {locale === "zh"
          ? "概率预测，不构成博彩或投资建议。"
          : "Probabilistic forecasts, not betting or investment advice."}
      </p>
    </aside>
  );
}

import type { ChatRequest, ChatResponse, Locale } from "@wci/contracts";
import { NextRequest, NextResponse } from "next/server";
import { getMatch, getTeam, matches } from "@/lib/data";
import { formatPercent } from "@/lib/i18n";
import { allowRequest } from "@/lib/rate-limit";

function isChatRequest(value: unknown): value is ChatRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.language === "en" || candidate.language === "zh") &&
    typeof candidate.message === "string" &&
    Array.isArray(candidate.conversationHistory)
  );
}

function answerFor(locale: Locale, message: string, matchId?: string): string {
  const selected =
    (matchId ? getMatch(matchId) : undefined) ??
    matches.find((match) => {
      const home = getTeam(match.homeTeamId);
      const away = getTeam(match.awayTeamId);
      const haystack = `${home.name.en} ${home.name.zh} ${away.name.en} ${away.name.zh}`.toLowerCase();
      return haystack.split(" ").some((token) => token.length > 2 && message.toLowerCase().includes(token));
    }) ??
    matches[0];

  if (!selected) return locale === "zh" ? "当前没有可用比赛。" : "No match is currently available.";
  const home = getTeam(selected.homeTeamId);
  const away = getTeam(selected.awayTeamId);
  const p = selected.prediction;
  const likely = p.scorelines[0];
  const strongest = p.home > p.away ? home : away;
  const strongestProbability = Math.max(p.home, p.away);

  if (/市场|market|polymarket|分歧|edge/i.test(message)) {
    return locale === "zh"
      ? `市场观点与模型预测必须分开看。当前比赛的集成模型为 ${home.name.zh} ${formatPercent(p.home, locale)}、平局 ${formatPercent(p.draw, locale)}、${away.name.zh} ${formatPercent(p.away, locale)}。交易判断还需使用可成交买卖价、流动性、费用和模型不确定性，不能只比较页面中间价。`
      : `Market views and model forecasts must be separated. The ensemble currently has ${home.name.en} ${formatPercent(p.home, locale)}, draw ${formatPercent(p.draw, locale)}, and ${away.name.en} ${formatPercent(p.away, locale)}. Any trade assessment must use executable bids/asks, liquidity, fees, and model uncertainty, not just a displayed mid-price.`;
  }

  if (/为什么|why|原因|reason/i.test(message)) {
    return locale === "zh"
      ? `模型略看好${strongest.name.zh}（${formatPercent(strongestProbability, locale)}），主要来自 Elo 实力、近期攻防状态和市场共识。双方模型差异不大，平局概率仍有 ${formatPercent(p.draw, locale)}，因此这不是确定性判断。阵容尚未确认，发布首发后需要重新预测。`
      : `The model slightly leans ${strongest.name.en} (${formatPercent(strongestProbability, locale)}), mainly due to Elo strength, recent attack/defence, and market consensus. The gap is small and the draw remains ${formatPercent(p.draw, locale)}, so this is not a certain call. Lineups are unconfirmed and the forecast should refresh after they are announced.`;
  }

  return locale === "zh"
    ? `${home.name.zh}对${away.name.zh}的 90 分钟概率是：主胜 ${formatPercent(p.home, locale)}、平局 ${formatPercent(p.draw, locale)}、客胜 ${formatPercent(p.away, locale)}。${likely ? `最可能比分为 ${likely.home}-${likely.away}（${formatPercent(likely.probability, locale)}）` : ""}。模型更新时间 ${p.updatedAt}。`
    : `For ${home.name.en} vs ${away.name.en}, the 90-minute probabilities are home ${formatPercent(p.home, locale)}, draw ${formatPercent(p.draw, locale)}, away ${formatPercent(p.away, locale)}. ${likely ? `The most likely score is ${likely.home}-${likely.away} (${formatPercent(likely.probability, locale)})` : ""}. Model timestamp: ${p.updatedAt}.`;
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "local";
  if (!allowRequest(`chat:${forwarded}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limit", message: "Too many chat requests" }, { status: 429 });
  }
  const body: unknown = await request.json().catch(() => null);
  if (!isChatRequest(body)) {
    return NextResponse.json({ error: "invalid_request", message: "Invalid chat request" }, { status: 400 });
  }
  const selected = body.matchId ? getMatch(body.matchId) : matches[0];
  const response: ChatResponse = {
    answer: answerFor(body.language, body.message, body.matchId),
    relatedMatches: selected
      ? [
          {
            id: selected.id,
            homeTeam: getTeam(selected.homeTeamId).name[body.language],
            awayTeam: getTeam(selected.awayTeamId).name[body.language],
            kickoffAt: selected.kickoffAt
          }
        ]
      : [],
    sources: [
      {
        id: "prediction",
        title: "WCI ensemble prediction v0.1.0",
        sourceType: "model",
        observedAt: selected?.prediction.updatedAt ?? new Date().toISOString()
      },
      {
        id: "fixture",
        title: "Versioned fixture snapshot",
        sourceType: "fact",
        observedAt: selected?.prediction.updatedAt ?? new Date().toISOString()
      }
    ],
    modelTimestamp: selected?.prediction.updatedAt ?? new Date().toISOString(),
    disclaimer:
      body.language === "zh"
        ? "这是概率预测，不保证赛果，也不构成博彩或投资建议。"
        : "This is a probabilistic forecast, not a guaranteed result or betting/investment advice."
  };
  return NextResponse.json(response);
}

import type { ChatRequest, ChatResponse } from "@wci/contracts";
import { getMatch, getTeam, matches, sources } from "@/lib/data";
import { json, rateLimit } from "@/lib/api";

function answerFromEvidence(body: ChatRequest): ChatResponse {
  const locale = body.language;
  const text = body.message.toLowerCase();
  const named = matches.find((match) => {
    const home = getTeam(match.homeTeamId);
    const away = getTeam(match.awayTeamId);
    return [home.name.en, home.name.zh, away.name.en, away.name.zh].some((name) => text.includes(name.toLowerCase()));
  });
  const match = (body.matchId && getMatch(body.matchId)) || named || matches[0]!;
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const pct = (value: number) => new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", { style: "percent", maximumFractionDigits: 1 }).format(value);
  const score = match.prediction.scorelines[0]!;
  const market = match.prediction.models.find((model) => model.model === "Market consensus");
  const wantsWhy = /why|为什么|原因|看好/.test(text);
  const wantsUpset = /upset|爆冷/.test(text);
  const answer = locale === "zh"
    ? wantsUpset
      ? `${home.name.zh} 对 ${away.name.zh} 的概率较接近，弱势一方获胜概率为 ${pct(Math.min(match.prediction.home, match.prediction.away))}。这只是模型定义的潜在爆冷空间，不代表结果确定。`
      : wantsWhy
        ? `集成模型给出 ${home.name.zh} ${pct(match.prediction.home)}、平局 ${pct(match.prediction.draw)}、${away.name.zh} ${pct(match.prediction.away)}。主要依据是 Elo 实力、动态攻防、近期状态与市场共识；市场主胜概率约为 ${pct(market?.home ?? match.prediction.home)}。`
        : `${home.name.zh} 对 ${away.name.zh}：主胜 ${pct(match.prediction.home)}，平局 ${pct(match.prediction.draw)}，客胜 ${pct(match.prediction.away)}。最可能比分是 ${score.home}:${score.away}，但单一比分概率只有 ${pct(score.probability)}。`
    : wantsUpset
      ? `${home.name.en} vs ${away.name.en} is relatively balanced. The underdog win probability is ${pct(Math.min(match.prediction.home, match.prediction.away))}. That indicates upset potential, not certainty.`
      : wantsWhy
        ? `The ensemble has ${home.name.en} ${pct(match.prediction.home)}, draw ${pct(match.prediction.draw)}, and ${away.name.en} ${pct(match.prediction.away)}. The largest inputs are Elo strength, dynamic attack/defence, recent form, and market consensus; the market home probability is about ${pct(market?.home ?? match.prediction.home)}.`
        : `${home.name.en} vs ${away.name.en}: home ${pct(match.prediction.home)}, draw ${pct(match.prediction.draw)}, away ${pct(match.prediction.away)}. The most likely score is ${score.home}-${score.away}, but that exact score has only ${pct(score.probability)} probability.`;
  return {
    answer,
    relatedMatches: [{ id: match.id, homeTeam: home.name[locale], awayTeam: away.name[locale], kickoffAt: match.kickoffAt }],
    sources: sources.slice(0, 4).map((source) => ({ id: source.id, title: source.name, url: source.url, sourceType: source.category === "market" ? "market" : source.category === "model" ? "model" : "fact", observedAt: source.updatedAt })),
    modelTimestamp: match.prediction.updatedAt,
    disclaimer: locale === "zh" ? "仅为概率预测，不构成博彩或投资建议。" : "Probabilistic forecast only; not betting or investment advice."
  };
}

export async function POST(request: Request) {
  const limited = rateLimit(request, 20); if (limited) return limited;
  try {
    const body = await request.json() as ChatRequest;
    if (!body.message?.trim() || !["en", "zh"].includes(body.language)) return json({ title: "Invalid chat request", status: 400 }, { status: 400 });
    return json(answerFromEvidence(body), { headers: { "cache-control": "no-store" } });
  } catch {
    return json({ title: "Invalid JSON", status: 400 }, { status: 400 });
  }
}

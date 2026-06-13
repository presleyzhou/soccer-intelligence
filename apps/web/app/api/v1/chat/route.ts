import type { ChatRequest, ChatResponse } from "@wci/contracts";
import { json, rateLimit } from "@/lib/api";
import { liveSources } from "@/lib/live-data";

export async function POST(request: Request) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;
  try {
    const body = (await request.json()) as ChatRequest;
    if (!body.message?.trim() || !["en", "zh"].includes(body.language))
      return json({ title: "Invalid chat request", status: 400 }, { status: 400 });
    const answer =
      body.language === "zh"
        ? "Soccer Intelligence 当前使用 ESPN 世界杯实时赛程与比分、World Football Elo Ratings 实力快照和 Polymarket 公共市场数据。首页提供 Elo、Poisson、Dixon-Coles 等权研究预测，但尚未完成本站滚动样本外校准。"
        : "Soccer Intelligence uses ESPN for live World Cup fixtures and scores, World Football Elo Ratings for strength snapshots, and Polymarket public market data. The homepage provides an equal-weight Elo, Poisson, and Dixon-Coles research forecast that has not yet completed this site's rolling out-of-time calibration.";
    const response: ChatResponse = {
      answer,
      relatedMatches: [],
      sources: liveSources.map((source) => ({
        id: source.id,
        title: source.name,
        url: source.url,
        sourceType: source.category === "market" ? "market" : "fact",
        observedAt: new Date().toISOString()
      })),
      modelTimestamp: new Date().toISOString(),
      disclaimer:
        body.language === "zh"
          ? "实时数据可能延迟；研究预测并非确定结果或博彩建议。"
          : "Live data may be delayed; research forecasts are not certain results or betting advice."
    };
    return json(response, { headers: { "cache-control": "no-store" } });
  } catch {
    return json({ title: "Invalid JSON", status: 400 }, { status: 400 });
  }
}

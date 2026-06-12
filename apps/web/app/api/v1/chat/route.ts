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
        ? "Soccer Intelligence 当前使用 TheSportsDB 的世界杯实时赛程与比分，以及 Polymarket 公共市场数据。生产预测模型尚未发布，因此不会生成模拟胜率、晋级概率或冠军概率。"
        : "Soccer Intelligence currently uses TheSportsDB for live World Cup fixtures and scores, plus Polymarket public market data. No production forecast model is published, so simulated win, advancement, or champion probabilities are not generated.";
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
          ? "实时数据可能延迟；当前没有已发布的模型预测。"
          : "Live data may be delayed; no model forecast is currently published."
    };
    return json(response, { headers: { "cache-control": "no-store" } });
  } catch {
    return json({ title: "Invalid JSON", status: 400 }, { status: 400 });
  }
}

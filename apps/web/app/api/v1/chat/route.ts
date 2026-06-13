import type { ChatRequest, ChatResponse } from "@wci/contracts";
import { siteChatAnswer } from "@/lib/chat-answer";
import { json, rateLimit } from "@/lib/api";
import { liveSources } from "@/lib/live-data";

export async function POST(request: Request) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;
  try {
    const body = (await request.json()) as ChatRequest;
    if (!body.message?.trim() || !["en", "zh"].includes(body.language))
      return json({ title: "Invalid chat request", status: 400 }, { status: 400 });
    const response: ChatResponse = {
      answer: siteChatAnswer(body.message, body.language),
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

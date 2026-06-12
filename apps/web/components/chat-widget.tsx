"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ChatResponse, Locale } from "@wci/contracts";

type Message = { role: "user" | "assistant"; content: string };

function offlineAnswer(locale: Locale): string {
  return locale === "zh"
    ? "当前站点提供实时赛程、比分和预测市场数据。生产预测模型尚未发布，因此我不会给出模拟胜率或冠军概率。"
    : "The site currently provides live fixtures, scores, and prediction-market data. No production forecast model is published, so I will not provide simulated win or champion probabilities.";
}

export function ChatWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: locale === "zh" ? "可以询问实时数据来源和模型发布状态。" : "Ask about live data sources and model publication status." }
  ]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(history);
    setMessage("");
    setLoading(true);
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/api/v1/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: locale, message: trimmed, conversationHistory: history.slice(-8) })
      });
      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: offlineAnswer(locale) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-shell">
      {open && (
        <section className="card chat-panel" aria-label="AI football assistant">
          <div className="section-header"><strong>Soccer Intelligence AI</strong><button className="pill" onClick={() => setOpen(false)} aria-label="Close chat"><X size={16} /></button></div>
          <div className="chat-log">{messages.map((item, index) => <div key={index} className={`bubble ${item.role}`}>{item.content}</div>)}</div>
          <form className="chat-form" onSubmit={submit}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={locale === "zh" ? "数据多久刷新一次？" : "How often does live data refresh?"} />
            <button className="button primary" type="submit" disabled={loading}><Send size={16} /></button>
          </form>
          <p className="tiny muted">{locale === "zh" ? "回答区分事实、模型预测与市场观点。" : "Answers distinguish facts, model forecasts, and market views."}</p>
        </section>
      )}
      <button className="button primary chat-toggle" onClick={() => setOpen((value) => !value)}>
        <MessageCircle size={17} /> {locale === "zh" ? "足球 AI" : "Football AI"}
      </button>
    </div>
  );
}

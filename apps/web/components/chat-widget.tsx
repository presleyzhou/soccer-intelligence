"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ChatResponse, Locale } from "@wci/contracts";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: locale === "zh" ? "可以问我比赛概率、晋级机会或模型与市场的分歧。" : "Ask about match probabilities, advancement chances, or model-market disagreement." }
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
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: locale, message: trimmed, conversationHistory: history.slice(-8) })
      });
      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: locale === "zh" ? "服务暂时不可用，请稍后重试。" : "The service is temporarily unavailable. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-shell">
      {open && (
        <section className="card chat-panel" aria-label="AI football assistant">
          <div className="section-header"><strong>WCI AI</strong><button className="pill" onClick={() => setOpen(false)} aria-label="Close chat"><X size={16} /></button></div>
          <div className="chat-log">{messages.map((item, index) => <div key={index} className={`bubble ${item.role}`}>{item.content}</div>)}</div>
          <form className="chat-form" onSubmit={submit}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={locale === "zh" ? "为什么模型看好西班牙？" : "Why does the model like Spain?"} />
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

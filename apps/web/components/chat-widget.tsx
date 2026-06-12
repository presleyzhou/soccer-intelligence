"use client";

import type { ChatResponse, Locale } from "@wci/contracts";
import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        locale === "zh"
          ? "可以问我比赛概率、模型原因、晋级机会或市场分歧。回答会区分事实、模型和市场观点。"
          : "Ask about match probabilities, model drivers, progression chances, or market disagreement. I separate facts, forecasts, and market views."
    }
  ]);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: locale, message, conversationHistory: next })
      });
      const payload = (await response.json()) as ChatResponse;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `${payload.answer}\n\n${payload.disclaimer}` }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            locale === "zh" ? "聊天服务暂时不可用，请稍后重试。" : "Chat is temporarily unavailable. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open ? (
        <section className="chat-panel" aria-label="Football intelligence chat">
          <div className="chat-head match-meta">
            <strong>{locale === "zh" ? "AI 足球问答" : "Football intelligence"}</strong>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </div>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {loading ? (
              <div className="chat-message">
                {locale === "zh" ? "正在核对当前预测…" : "Checking the current forecast…"}
              </div>
            ) : null}
          </div>
          <form className="chat-compose" onSubmit={submit}>
            <input
              className="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={locale === "zh" ? "为什么更看好西班牙？" : "Why does the model lean Spain?"}
            />
            <button className="icon-button" type="submit" aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : null}
      <button className="chat-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        <MessageCircle size={18} /> {locale === "zh" ? "问模型" : "Ask model"}
      </button>
    </>
  );
}

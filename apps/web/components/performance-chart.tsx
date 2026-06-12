"use client";

import type { Locale } from "@wci/contracts";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { modelMetrics } from "@/lib/data";

export function PerformanceChart({ locale }: { locale: Locale }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={modelMetrics.windows}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="window" stroke="var(--muted)" fontSize={11} />
          <YAxis domain={[0.17, 0.2]} stroke="var(--muted)" fontSize={11} />
          <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="ensemble"
            name={locale === "zh" ? "集成模型 RPS" : "Ensemble RPS"}
            stroke="var(--accent)"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="market"
            name={locale === "zh" ? "市场 RPS" : "Market RPS"}
            stroke="var(--accent-2)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

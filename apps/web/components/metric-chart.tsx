"use client";

import type { Locale, ModelProbability } from "@wci/contracts";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ModelComparisonChart({ models, locale }: { models: ModelProbability[]; locale: Locale }) {
  const data = models.map((model) => ({
    name: model.model,
    home: Math.round(model.home * 1000) / 10,
    draw: Math.round(model.draw * 1000) / 10,
    away: Math.round(model.away * 1000) / 10
  }));
  return (
    <div style={{ width: "100%", height: 330 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -15, right: 10 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} />
          <YAxis stroke="var(--muted)" unit="%" fontSize={11} />
          <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }} />
          <Legend />
          <Bar dataKey="home" name={locale === "zh" ? "主胜" : "Home"} fill="var(--accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="draw" name={locale === "zh" ? "平局" : "Draw"} fill="var(--warning)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="away" name={locale === "zh" ? "客胜" : "Away"} fill="var(--accent-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import type { ModelProbability } from "@wci/contracts";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ModelChart({ models }: { models: ModelProbability[] }) {
  const data = models.map((model) => ({ name: model.model, Home: model.home * 100, Draw: model.draw * 100, Away: model.away * 100 }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -20, right: 6 }}>
          <CartesianGrid stroke="#24463a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#9bb0a7", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9bb0a7", fontSize: 11 }} domain={[0, 60]} />
          <Tooltip contentStyle={{ background: "#0d2019", border: "1px solid #24463a" }} />
          <Legend />
          <Bar dataKey="Home" fill="#76f0a4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Draw" fill="#f3c969" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Away" fill="#76a9f0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

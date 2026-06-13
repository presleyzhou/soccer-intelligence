import type { Locale } from "@wci/contracts";

export function siteChatAnswer(message: string, locale: Locale): string {
  const normalized = message.toLowerCase();
  if (/市场|赔率|polymarket|market|odds/.test(normalized)) {
    return locale === "zh"
      ? "市场观点：预测市场页只查询 Polymarket 的 2026 男足世界杯标签，使用最佳买卖价中点，并对胜平负或冠军互斥市场去除概率总和偏差。价格可能延迟，也不等于真实概率。"
      : "Market view: the markets page queries only Polymarket's dedicated 2026 men's World Cup tag, uses the best bid/ask midpoint, and normalizes mutually exclusive match or title outcomes. Prices can lag and are not true probabilities.";
  }
  if (/模拟|冠军|晋级|出线|simulate|champion|advance|qualif/.test(normalized)) {
    return locale === "zh"
      ? "模型预测：世界杯模拟固定已结束赛果，并用注明时间的 Elo 与 Poisson 比分分布模拟未来比赛。默认运行 50,000 次，可在“世界杯模拟”页调整球队实力后重新计算。"
      : "Model forecast: the World Cup simulator fixes completed results and simulates future matches from timestamped Elo strength and Poisson score distributions. It runs 50,000 iterations by default and supports team-strength scenarios.";
  }
  if (/回测|准确|表现|泄漏|log loss|brier|rps|backtest|accuracy|leak/.test(normalized)) {
    return locale === "zh"
      ? "验证事实：历史回测逐场先预测、再更新评级，从 2010 年开始评估，并展示 Log Loss、Brier、RPS、ECE 与准确率。这一顺序防止赛果进入自身预测。它验证的是透明 Elo 基线，不代表集成模型已经校准。"
      : "Validation fact: the historical backtest predicts each match before updating ratings, evaluates from 2010 onward, and reports Log Loss, Brier, RPS, ECE, and accuracy. This ordering keeps each result out of its own forecast. It validates a transparent Elo baseline, not a calibrated ensemble.";
  }
  return locale === "zh"
    ? "当前站点提供 ESPN 实时赛程与比分、Elo/Poisson/Dixon-Coles 研究预测、50,000 次世界杯模拟，以及严格按时间滚动的 Elo 历史回测。预测不是确定结果或博彩建议。"
    : "The site provides ESPN live fixtures and scores, Elo/Poisson/Dixon-Coles research forecasts, a 50,000-run World Cup simulation, and a strictly chronological Elo backtest. Forecasts are not certain results or betting advice.";
}

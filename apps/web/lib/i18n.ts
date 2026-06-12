import type { Locale } from "@wci/contracts";

export const locales: Locale[] = ["en", "zh"];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

const copy = {
  en: {
    brand: "Soccer Intelligence",
    tagline: "Live facts first. Forecasts only when verified.",
    nav: {
      dashboard: "Dashboard",
      matches: "Matches",
      tournament: "Tournament",
      markets: "Markets",
      methodology: "Methodology",
      backtest: "Backtest"
    },
    modelUpdated: "Model updated",
    nextSpotlight: "Next spotlight",
    probability: "Win probability",
    home: "Home",
    draw: "Draw",
    away: "Away",
    likelyScore: "Most likely score",
    recentMatches: "Today & upcoming",
    championRace: "Champion probability",
    performance: "Recent model performance",
    qualification: "Tournament progression",
    sourceStatus: "Data source status",
    simulated: "No simulated fixtures or performance claims are published as current data.",
    disclaimer: "Probabilistic analysis only. Not betting or investment advice."
  },
  zh: {
    brand: "Soccer Intelligence",
    tagline: "实时事实优先，预测必须经过验证",
    nav: {
      dashboard: "首页",
      matches: "比赛",
      tournament: "世界杯模拟",
      markets: "预测市场",
      methodology: "模型方法",
      backtest: "历史回测"
    },
    modelUpdated: "模型更新时间",
    nextSpotlight: "下一场焦点比赛",
    probability: "胜平负概率",
    home: "主胜",
    draw: "平局",
    away: "客胜",
    likelyScore: "最可能比分",
    recentMatches: "今日与近期比赛",
    championRace: "冠军概率",
    performance: "近期模型表现",
    qualification: "赛事晋级概率",
    sourceStatus: "数据源状态",
    simulated: "本站不会把模拟赛程、模拟概率或模拟业绩作为当前数据发布。",
    disclaimer: "仅为概率分析，不构成博彩或投资建议。"
  }
} as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}

export function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(value));
}

export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}

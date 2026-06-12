import { modelMetrics } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function Model({ params }: { params: Promise<{ locale: string }> }) {
 const {locale}=await params;if(!isLocale(locale))notFound();
 return <main className="container"><header className="page-head"><h1>{locale==="zh"?"模型状态":"Model status"}</h1></header><div className="grid two"><section className="card"><h2>WCI Ensemble v0.1.0</h2><p className="muted">{locale==="zh"?"Elo、Dixon-Coles 与市场共识的非负概率池。":"A non-negative probability pool of Elo, Dixon-Coles and market consensus."}</p><div className="metric-grid"><div className="metric"><strong>{modelMetrics.rps}</strong><span className="tiny muted">RPS</span></div><div className="metric"><strong>{modelMetrics.logLoss}</strong><span className="tiny muted">Log loss</span></div><div className="metric"><strong>{formatPercent(modelMetrics.ece,locale)}</strong><span className="tiny muted">ECE</span></div></div></section><section className="card"><h2>{locale==="zh"?"发布约束":"Publication gates"}</h2><p>✓ Point-in-time features</p><p>✓ Probability sum validation</p><p>✓ Immutable model version</p><p>✓ Source snapshot</p></section></div></main>
}

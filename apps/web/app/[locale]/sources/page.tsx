import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { sources } from "@/lib/data";
import { formatDate, isLocale } from "@/lib/i18n";

export default async function SourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <p className="eyebrow">{locale === "zh" ? "数据治理" : "Data governance"}</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>
        {locale === "zh" ? "来源与更新时间" : "Sources and freshness"}
      </h1>
      <section className="section card card-pad">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{locale === "zh" ? "来源" : "Source"}</th>
                <th>{locale === "zh" ? "类别" : "Category"}</th>
                <th>{locale === "zh" ? "状态" : "Status"}</th>
                <th>{locale === "zh" ? "更新时间" : "Updated"}</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id}>
                  <td>{source.name}</td>
                  <td>{source.category}</td>
                  <td>
                    <span className={`status-chip ${source.status === "live" ? "live" : ""}`}>{source.status}</span>
                  </td>
                  <td>{formatDate(source.updatedAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

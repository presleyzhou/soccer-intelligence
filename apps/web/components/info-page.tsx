import type { Locale } from "@wci/contracts";

export function InfoPage({
  locale,
  eyebrow,
  title,
  description,
  sections
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
}) {
  return (
    <main className="page">
      <p className="eyebrow">{eyebrow}</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{title}</h1>
      <p className="lead" style={{ color: "var(--muted)" }}>
        {description}
      </p>
      <div className="section grid grid-2">
        {sections.map((section) => (
          <section className="card card-pad" key={section.title}>
            <h2>{section.title}</h2>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 24 }}>
        Locale: {locale}
      </p>
    </main>
  );
}

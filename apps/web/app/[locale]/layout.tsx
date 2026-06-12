import "../globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import { Header } from "@/components/header";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "World Cup Intelligence",
  description: "Transparent, calibrated international football forecasts."
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>
        <Header locale={locale} />
        {children}
        <ChatWidget locale={locale} />
        <footer className="footer"><div className="container">World Cup Intelligence is independent and is not affiliated with FIFA. Predictions are uncertain and informational only.</div></footer>
      </body>
    </html>
  );
}

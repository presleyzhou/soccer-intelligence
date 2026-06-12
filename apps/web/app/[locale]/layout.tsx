import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import { Navigation } from "@/components/navigation";
import { SiteFooter } from "@/components/site-footer";
import { isLocale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <div className="site-shell">
      <Navigation locale={locale} />
      {children}
      <SiteFooter locale={locale} />
      <ChatWidget locale={locale} />
    </div>
  );
}

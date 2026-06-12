import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "World Cup Intelligence",
    template: "%s | World Cup Intelligence"
  },
  description: "Transparent, bilingual probabilities for international football and tournament simulation."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

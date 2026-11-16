import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lead Scout — лиды МСБ по нишам",
  description:
    "Веб-приложение для сбора таблицы лидов малого и среднего бизнеса по нише и городу через OpenStreetMap без LLM-токенов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${fraunces.variable} min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

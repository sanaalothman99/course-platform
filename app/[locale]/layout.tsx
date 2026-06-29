import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A to Z Automation | Online PLC Training",
  description: "Learn PLC programming from scratch with hands-on online courses. TIA Portal, Step 7, HMI, Factory I/O and more. Professional industrial automation training.",
  keywords: "PLC, automation, TIA Portal, SIMATIC, HMI, online courses, industrial automation",
  openGraph: {
    title: "A to Z Automation | Online PLC Training",
    description: "Learn PLC programming from scratch with hands-on online courses.",
    url: "https://atozautomation.de",
    siteName: "A to Z Automation",
  },
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

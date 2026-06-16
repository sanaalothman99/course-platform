import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "A to Z Automation | Online PLC Training",
  description: "Learn PLC programming from scratch with hands-on online courses. TIA Portal, Step 7, HMI, Factory I/O and more.",
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
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

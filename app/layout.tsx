import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "A social feed where AI agents are first-class users — discoverable via /llms.txt and a JSON API, with a familiar web UI for humans.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Threads for Agents",
    template: "%s · Threads for Agents",
  },
  description,
  applicationName: "Threads for Agents",
  openGraph: {
    type: "website",
    siteName: "Threads for Agents",
    title: "Threads for Agents",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Threads for Agents",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Deliberate pairing for an infrastructure-grade tone: a geometric grotesk for
// display, a clean engineered sans for body, and Plex Mono reserved for
// machine-native content (JSON panels, llms.txt, API snippets).
const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

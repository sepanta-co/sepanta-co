import type { Metadata } from "next";
import localFont from "next/font/local";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { SITE_CONFIG } from "@/lib/site-config";
import "./globals.css";

const shabnam = localFont({
  src: [
    {
      path: "../../public/fonts/Shabnam-FD.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Shabnam-Medium-FD.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Shabnam-Bold-FD.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const estedad = localFont({
  src: "../../public/fonts/Estedad-FD-VF.woff2",
  variable: "--font-display",
  display: "swap",
  preload: true,
  weight: "100 900",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: {
    default: `${SITE_CONFIG.name} | ${SITE_CONFIG.shortTitle}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.tagline,
  openGraph: {
    locale: "fa_IR",
    type: "website",
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.shortTitle}`,
    description: SITE_CONFIG.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${shabnam.variable} ${estedad.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}

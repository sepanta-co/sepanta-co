import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-[3px] focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-canvas"
        >
          پرش به محتوای اصلی
        </a>

        <Header />

        <main id="main-content" className="min-h-[70vh] flex-1 pb-16 md:pb-0">
          {children}
        </main>

        <Footer />
        <MobileBottomBar />
      </body>
    </html>
  );
}

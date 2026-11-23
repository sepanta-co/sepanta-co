import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";

const estedad = localFont({
  src: "./fonts/Estedad-FD.woff2",
  weight: "100 900",
  variable: "--font-estedad",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | گروه صنعتی سپنتا",
    default: "گروه صنعتی سپنتا | تولید درب و پنجره دوجداره، آلومینیوم ترمال بریک و دربهای ساختمانی",
  },
  description:
    "تولیدکننده تخصصی انواع درب و پنجره دوجداره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی تاشو و درب ضد سرقت با ۲۵ سال سابقه از ۱۳۸۰، ظرفیت ماهانه ۱٬۰۰۰ واحد و پوشش در زنجان و سراسر ایران.",
  keywords: [
    "گروه صنعتی سپنتا",
    "پنجره دوجداره زنجان",
    "پنجره upvc",
    "آلومینیوم ترمال بریک",
    "شیشه بالکنی تاشو",
    "جام بالکنی",
    "درب ضد سرقت",
    "تعویض پنجره بدون تخریب",
  ],
  authors: [{ name: "گروه صنعتی سپنتا" }],
  creator: "گروه صنعتی سپنتا",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0E11",
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
      className={`${estedad.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-canvas text-ink font-sans">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomBar />
      </body>
    </html>
  );
}

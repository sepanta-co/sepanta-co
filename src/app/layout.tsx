import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "گروه صنعتی سپنتا",
  description: "وب‌سایت رسمی گروه صنعتی سپنتا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}

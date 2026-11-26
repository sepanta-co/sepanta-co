"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileBottomBar } from "./MobileBottomBar";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}

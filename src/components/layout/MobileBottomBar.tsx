"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, SlidersHorizontal, Building2, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
  const rawPathname = usePathname() || "/";
  const normalizedPath = rawPathname.replace(/\/+$/, "") || "/";

  return (
    <aside
      className="mobile-bottom-bar fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-lg print:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="دسترسی سریع موبایل"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {/* محصولات */}
        <Link
          href="/products/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] transition-colors border-e border-zinc-100",
            normalizedPath.startsWith("/products")
              ? "text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-950"
          )}
        >
          <LayoutGrid className="w-5 h-5 stroke-[1.75]" />
          <span>محصولات</span>
        </Link>

        {/* برآورد قیمت */}
        <Link
          href="/configurator/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] transition-colors border-e border-zinc-100",
            normalizedPath.startsWith("/configurator")
              ? "text-brass font-bold bg-amber-50/50"
              : "text-brass font-semibold hover:bg-amber-50/30"
          )}
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
          <span>برآورد قیمت</span>
        </Link>

        {/* پروژهها */}
        <Link
          href="/projects/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] transition-colors border-e border-zinc-100",
            normalizedPath.startsWith("/projects")
              ? "text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-950"
          )}
        >
          <Building2 className="w-5 h-5 stroke-[1.75]" />
          <span>پروژهها</span>
        </Link>

        {/* تماس */}
        <Link
          href="/about/#contact"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] transition-colors",
            normalizedPath.startsWith("/about")
              ? "text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-950"
          )}
        >
          <PhoneCall className="w-5 h-5 stroke-[1.75]" />
          <span>تماس</span>
        </Link>
      </div>
    </aside>
  );
}

import Link from "next/link";
import { LayoutGrid, Phone, SlidersHorizontal } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function MobileBottomBar() {
  return (
    <nav
      aria-label="دسترسی سریع موبایل"
      className="no-print fixed inset-x-0 bottom-0 z-40 h-16 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid h-full grid-cols-3">
        <Link
          href="/products/"
          className="flex flex-col items-center justify-center gap-1 border-e border-border text-ink transition-colors hover:bg-canvas"
        >
          <LayoutGrid
            className="h-4 w-4 text-charcoal"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold">محصولات</span>
        </Link>

        <Link
          href="/configurator/"
          className="flex flex-col items-center justify-center gap-1 border-e border-border bg-charcoal text-canvas transition-colors hover:bg-charcoal-soft"
        >
          <SlidersHorizontal
            className="h-4 w-4"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold">برآورد قیمت</span>
        </Link>

        <a
          href={SITE_CONFIG.contact.phoneHref}
          className="flex flex-col items-center justify-center gap-1 text-ink transition-colors hover:bg-canvas"
        >
          <Phone
            className="h-4 w-4 text-bronze"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold">تماس مستقیم</span>
        </a>
      </div>
    </nav>
  );
}

import Link from "next/link";
import { LayoutGrid, Phone, SlidersHorizontal } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function MobileBottomBar() {
  return (
    <nav
      aria-label="دسترسی سریع موبایل"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-3 gap-2 px-3 py-2">
        <a
          href={SITE_CONFIG.contact.phoneHref}
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
        >
          <Phone className="h-4 w-4 text-ink" aria-hidden="true" />
          <span className="text-[11px] font-semibold">تماس مستقیم</span>
        </a>

        <Link
          href="/configurator/"
          className="flex flex-col items-center justify-center gap-1 rounded-xl bg-accent py-1.5 text-white shadow-xs transition-colors hover:bg-accent-hover"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span className="text-[11px] font-semibold">محاسبه‌گر هوشمند</span>
        </Link>

        <Link
          href="/products/"
          className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
        >
          <LayoutGrid className="h-4 w-4 text-ink" aria-hidden="true" />
          <span className="text-[11px] font-semibold">محصولات</span>
        </Link>
      </div>
    </nav>
  );
}

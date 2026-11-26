import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted sm:gap-2 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-1.5 sm:gap-2"
            >
              {index > 0 && (
                <ChevronLeft
                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-semibold text-ink"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

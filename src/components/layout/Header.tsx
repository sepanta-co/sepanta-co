"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, SlidersHorizontal, X } from "lucide-react";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/site-config";
import { BrandMark } from "./BrandMark";

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname() || "/";
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 md:h-20 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Start (Right in RTL): Brand Logo + Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="باز کردن منوی ناوبری"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:bg-surface-subtle lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              href="/"
              className="group flex items-center gap-2.5 text-ink transition-opacity hover:opacity-90"
            >
              <BrandMark className="h-7 w-7 shrink-0 text-ink transition-colors group-hover:text-accent" />
              <span className="flex flex-col">
                <span className="text-sm font-bold tracking-tight sm:text-base">
                  {SITE_CONFIG.name}
                </span>
                <span className="hidden text-[11px] font-medium text-ink-muted sm:block">
                  صنایع درب و پنجره معماری
                </span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            aria-label="منوی اصلی"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent-soft text-accent-hover font-semibold"
                      : "text-ink-muted hover:bg-surface-subtle hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* End (Left in RTL): Phone + Primary CTA */}
          <div className="flex items-center gap-3">
            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink xl:inline-flex"
              aria-label={`تماس با ${SITE_CONFIG.name}: ${SITE_CONFIG.contact.phoneDisplay}`}
            >
              <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
              <span dir="ltr" className="tabular-nums">
                {SITE_CONFIG.contact.phoneDisplay}
              </span>
            </a>

            <Link
              href="/configurator/"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>برآورد و مشاوره هوشمند</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile RTL Slide-Over Drawer (anchored to start-0 -> right edge in RTL) */}
      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="fixed inset-0 bg-surface-dark/60 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 start-0 flex w-80 max-w-[85vw] flex-col border-e border-border bg-surface shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 text-ink"
              >
                <BrandMark className="h-7 w-7 text-ink" />
                <span className="text-sm font-bold">{SITE_CONFIG.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن منوی ناوبری"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="ناوبری موبایل" className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const active = isRouteActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          active
                            ? "bg-accent-soft text-accent-hover font-semibold"
                            : "text-ink hover:bg-surface-subtle"
                        }`}
                      >
                        <span>{item.label}</span>
                        {active && (
                          <span
                            className="h-2 w-2 rounded-full bg-accent"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 rounded-xl border border-border bg-surface-subtle p-4">
                <p className="text-xs font-medium text-ink-muted">
                  مشاوره مستقیم فنی و فروش
                </p>
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  className="mt-2 flex items-center gap-2 text-sm font-bold text-ink"
                >
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span dir="ltr" className="tabular-nums">
                    {SITE_CONFIG.contact.phoneDisplay}
                  </span>
                </a>
                <p className="mt-2 text-xs leading-6 text-ink-muted">
                  {SITE_CONFIG.contact.workingHours}
                </p>
              </div>
            </nav>

            <div className="border-t border-border p-4">
              <Link
                href="/configurator/"
                onClick={() => setDrawerOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>برآورد و مشاوره هوشمند</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

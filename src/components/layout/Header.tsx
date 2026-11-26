"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ClipboardCheck,
  Menu,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  NAV_ITEMS,
  PORTAL_NAV_LINKS,
  PRODUCT_NAV_LINKS,
  SITE_CONFIG,
} from "@/lib/site-config";
import { BrandMark } from "./BrandMark";

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname() || "/";
  const isConfiguratorPage = isRouteActive(pathname, "/configurator/");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

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
      {/* Row 1: Light Warm-Stone Utility Strip */}
      <div className="no-print hidden h-9 border-b border-border bg-surface-warm text-[12px] text-ink-muted md:block">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <p className="font-medium text-ink-muted">
            تولید CNC کارخانه زنجان و اجرای سراسری پروژه‌ها در ایران
          </p>

          <div className="flex items-center gap-4">
            {PORTAL_NAV_LINKS.map((portal, index) => (
              <Link
                key={portal.href}
                href={portal.href}
                className={`inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-charcoal ${
                  index > 0 ? "border-s border-border ps-4" : ""
                }`}
              >
                <ShieldCheck
                  className="h-3.5 w-3.5 text-ink-subtle"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>{portal.label}</span>
              </Link>
            ))}

            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="inline-flex items-center gap-1.5 border-s border-border ps-4 font-semibold text-charcoal transition-colors hover:text-bronze"
            >
              <Phone
                className="h-3.5 w-3.5 text-ink-subtle"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span dir="ltr" className="tabular-nums">
                {SITE_CONFIG.contact.phoneDisplay}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Row 2: Main Sticky Warm Alabaster Architectural Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Start: Editorial Wordmark & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="باز کردن منوی ناوبری"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-border bg-surface text-charcoal transition-colors hover:border-border-strong lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>

            <Link
              href="/"
              className="group flex items-center gap-2.5 text-charcoal transition-opacity hover:opacity-85"
            >
              <BrandMark className="h-7 w-7 shrink-0 text-charcoal" />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-base font-extrabold tracking-tight text-charcoal sm:text-lg">
                  سپنتا
                </span>
                <span className="text-[11px] font-medium text-ink-muted">
                  گروه صنعتی سپنتا
                </span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Architectural Navigation (borderless, flush bronze underline) */}
          <nav
            aria-label="منوی اصلی"
            className="hidden h-full items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(pathname, item.href);
              if (item.href === "/products/") {
                return (
                  <div
                    key={item.href}
                    className="relative flex h-full items-center"
                    onMouseEnter={() => setProductsMenuOpen(true)}
                    onMouseLeave={() => setProductsMenuOpen(false)}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex h-16 items-center gap-1 px-3.5 text-sm transition-colors ${
                        active
                          ? "font-semibold text-charcoal after:absolute after:inset-x-3.5 after:bottom-0 after:h-[2px] after:bg-bronze"
                          : "font-medium text-ink-muted hover:text-charcoal"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          productsMenuOpen ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </Link>

                    {productsMenuOpen && (
                      <div className="absolute top-full start-0 z-50 w-[520px] border border-border bg-surface p-5">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <span className="font-display text-xs font-bold text-charcoal">
                            ۷ خط تولید تخصصی کارخانه زنجان
                          </span>
                          <Link
                            href="/products/"
                            onClick={() => setProductsMenuOpen(false)}
                            className="text-xs font-semibold text-bronze hover:text-bronze-hover"
                          >
                            مشاهده کاتالوگ کامل ←
                          </Link>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          {PRODUCT_NAV_LINKS.map((prod) => (
                            <Link
                              key={prod.slug}
                              href={prod.href}
                              onClick={() => setProductsMenuOpen(false)}
                              className="flex items-center justify-between border border-transparent px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-border hover:bg-canvas hover:text-charcoal"
                            >
                              <span>{prod.title}</span>
                              <span className="text-[10px] font-medium text-ink-muted">
                                مشخصات
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex h-16 items-center px-3.5 text-sm transition-colors ${
                    active
                      ? "font-semibold text-charcoal after:absolute after:inset-x-3.5 after:bottom-0 after:h-[2px] after:bg-bronze"
                      : "font-medium text-ink-muted hover:text-charcoal"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* End: Understated Architectural CTA */}
          <div className="flex items-center gap-2.5">
            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="hidden min-h-[38px] items-center gap-1.5 rounded-[3px] border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-charcoal sm:inline-flex md:hidden"
              aria-label={`تماس با ${SITE_CONFIG.name}`}
            >
              <Phone
                className="h-3.5 w-3.5 text-ink-subtle"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span dir="ltr" className="tabular-nums">
                {SITE_CONFIG.contact.phoneDisplay}
              </span>
            </a>

            {isConfiguratorPage ? (
              <Link
                href="/track/"
                className="inline-flex items-center gap-2 rounded-[3px] border border-charcoal px-4 py-2 text-[13px] font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-canvas"
              >
                <ClipboardCheck
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>پیگیری سفارش</span>
              </Link>
            ) : (
              <Link
                href="/configurator/"
                className="inline-flex items-center gap-2 rounded-[3px] border border-charcoal px-4 py-2 text-[13px] font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-canvas"
              >
                <SlidersHorizontal
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>پیکربندی و برآورد قیمت</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile RTL Architectural Navigation Drawer */}
      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="fixed inset-0 bg-charcoal/65 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 start-0 flex w-80 max-w-[85vw] flex-col border-e border-border bg-canvas">
            <div className="flex h-16 items-center justify-between border-b border-border bg-surface px-4">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 text-charcoal"
              >
                <BrandMark className="h-6 w-6 text-charcoal" />
                <span className="font-display text-sm font-extrabold">
                  {SITE_CONFIG.name}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن منوی ناوبری"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-border bg-canvas text-ink-muted hover:text-charcoal"
              >
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="ناوبری موبایل" className="flex-1 overflow-y-auto p-4">
              <ul className="divide-y divide-border border border-border bg-surface">
                {NAV_ITEMS.map((item) => {
                  const active = isRouteActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                          active
                            ? "border-s-2 border-bronze bg-surface-warm font-semibold text-charcoal"
                            : "font-medium text-ink hover:bg-surface-warm/50"
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5">
                <p className="text-[11px] font-bold tracking-wide text-ink-muted">
                  خدمات مشتریان و پیگیری
                </p>
                <ul className="mt-2 divide-y divide-border border border-border bg-surface">
                  {PORTAL_NAV_LINKS.map((portal) => {
                    const active = isRouteActive(pathname, portal.href);
                    return (
                      <li key={portal.href}>
                        <Link
                          href={portal.href}
                          onClick={() => setDrawerOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            active
                              ? "border-s-2 border-bronze bg-surface-warm font-semibold text-charcoal"
                              : "font-medium text-ink hover:bg-surface-warm/50"
                          }`}
                        >
                          <span>{portal.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-6 border border-border bg-surface p-4">
                <p className="text-xs font-bold text-ink-muted">
                  دفتر فروش و مهندسی کارخانه
                </p>
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  className="mt-2 flex items-center gap-2 text-sm font-bold text-charcoal"
                >
                  <Phone
                    className="h-4 w-4 text-ink-subtle"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span dir="ltr" className="tabular-nums">
                    {SITE_CONFIG.contact.phoneDisplay}
                  </span>
                </a>
                <p className="mt-2 text-xs leading-6 text-ink-muted">
                  {SITE_CONFIG.contact.workingHours}
                </p>
              </div>
            </nav>

            <div className="border-t border-border bg-surface p-4">
              {isConfiguratorPage ? (
                <Link
                  href="/track/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[3px] bg-charcoal px-4 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft"
                >
                  <ClipboardCheck
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>پیگیری سفارش</span>
                </Link>
              ) : (
                <Link
                  href="/configurator/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[3px] bg-charcoal px-4 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft"
                >
                  <SlidersHorizontal
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>پیکربندی و برآورد قیمت</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

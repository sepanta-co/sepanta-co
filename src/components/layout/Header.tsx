"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/products/", label: "محصولات" },
  { href: "/configurator/", label: "محاسبه‌گر فنی" },
  { href: "/projects/", label: "پروژه‌ها" },
  { href: "/about/", label: "کارخانه و تماس" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rawPathname = usePathname() || "/";
  const normalizedPath = rawPathname.replace(/\/+$/, "") || "/";
  const isHome = normalizedPath === "/";

  useEffect(() => {
    const checkScroll = () => {
      const scrollPos = window.scrollY > 24 || document.documentElement.scrollTop > 24;
      setIsScrolled(scrollPos);
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    window.addEventListener("hashchange", checkScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("hashchange", checkScroll);
    };
  }, []);

  const showTransparent = isHome && !isScrolled && !mobileMenuOpen;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-200",
        showTransparent
          ? "bg-obsidian/65 backdrop-blur-md text-white border-b border-white/10"
          : "bg-white/95 backdrop-blur-md text-zinc-950 border-b border-zinc-200 shadow-xs"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Wordmark & Architectural Mark */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none"
            aria-label="صفحه اصلی گروه صنعتی سپنتا"
          >
            <div
              className={cn(
                "w-9 h-9 border flex items-center justify-center p-1.5 transition-colors",
                showTransparent
                  ? "border-white/80 group-hover:border-brass text-white"
                  : "border-zinc-900 group-hover:border-brass text-zinc-900"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full stroke-current fill-none stroke-[1.75]"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="3" y1="11" x2="21" y2="11" />
              </svg>
            </div>

            <div className="flex flex-col text-start">
              <span className="text-xl font-bold tracking-tight leading-none group-hover:text-brass transition-colors">
                سپنتا
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium pt-0.5 transition-colors",
                  showTransparent ? "text-white/70" : "text-zinc-500"
                )}
              >
                گروه صنعتی · تأسیس ۱۳۸۰
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const linkBase = link.href.replace(/\/+$/, "");
              const active =
                linkBase === "" ? normalizedPath === "/" : normalizedPath.startsWith(linkBase);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors relative py-1",
                    active
                      ? "text-brass font-bold"
                      : showTransparent
                      ? "text-white/85 hover:text-white"
                      : "text-zinc-600 hover:text-zinc-950"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-brass rounded-[1px]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/configurator/"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors focus:ring-2 focus:ring-brass focus:ring-offset-2"
            >
              <span>محاسبه قیمت</span>
              <ArrowLeft className="w-3.5 h-3.5 ms-1.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "md:hidden w-11 h-11 flex items-center justify-center border transition-colors focus:outline-none",
                showTransparent
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-zinc-200 text-zinc-900 hover:bg-zinc-100"
              )}
              aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-zinc-950 border-b border-zinc-200 px-4 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2 text-base font-semibold">
            {NAV_LINKS.map((link) => {
              const linkBase = link.href.replace(/\/+$/, "");
              const active =
                linkBase === "" ? normalizedPath === "/" : normalizedPath.startsWith(linkBase);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between",
                    active
                      ? "bg-amber-50 text-brass font-bold"
                      : "text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  <span>{link.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-brass" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-zinc-100">
            <Link
              href="/configurator/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-3 text-sm font-bold text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors"
            >
              <span>محاسبه قیمت</span>
              <ArrowLeft className="w-4 h-4 ms-2" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  SlidersHorizontal,
  LayoutGrid,
  Phone,
  RefreshCw,
} from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { PROJECTS } from "@/data/projects";
import { BASE_PATH } from "@/lib/assets";

const ALIAS_MAP: Record<string, string> = {
  quote: "/configurator/",
  "smart-quote": "/configurator/",
  calculator: "/configurator/",
  calc: "/configurator/",
  windows: "/products/",
  catalog: "/products/",
  doors: "/products/",
  contact: "/about/#contact",
  factory: "/about/#contact",
  about: "/about/",
  products: "/products/",
  projects: "/projects/",
  configurator: "/configurator/",
};

export function NotFoundClient() {
  const router = useRouter();
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let path = window.location.pathname || "";

    // Strip BASE_PATH if present
    if (BASE_PATH && path.startsWith(BASE_PATH)) {
      path = path.slice(BASE_PATH.length);
    }

    // Normalize: lowercase, strip redundant slashes, trim edge slashes
    const clean = path.toLowerCase().replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
    if (!clean) return;

    // 1. Direct alias match (e.g. "quote", "calculator", "contact")
    if (ALIAS_MAP[clean]) {
      const target = ALIAS_MAP[clean];
      setRedirectingTo(target);
      router.replace(target);
      return;
    }

    // 2. Check product slugs (e.g. "products/upvc-window" or "upvc-window" or "upvc")
    const productSlug = clean.replace(/^products\//, "");
    const matchedProduct = PRODUCTS.find(
      (p) =>
        p.slug.toLowerCase() === productSlug ||
        p.id.toLowerCase() === productSlug ||
        (p.configuratorSystem && p.configuratorSystem.toLowerCase() === productSlug)
    );
    if (matchedProduct) {
      const target = `/products/${matchedProduct.slug}/`;
      setRedirectingTo(target);
      router.replace(target);
      return;
    }

    // 3. Check project slugs (e.g. "projects/residential-renovation-zanjan-enghelab" or "project-zanjan-enghelab")
    const projectSlug = clean.replace(/^projects\//, "");
    const matchedProject = PROJECTS.find(
      (p) =>
        p.slug.toLowerCase() === projectSlug ||
        p.id.toLowerCase() === projectSlug
    );
    if (matchedProject) {
      const target = `/projects/${matchedProject.slug}/`;
      setRedirectingTo(target);
      router.replace(target);
      return;
    }

    // 4. Trailing slash recovery for known top routes if case mismatch
    const canonicalRoutes = ["products", "configurator", "projects", "about"];
    if (canonicalRoutes.includes(clean)) {
      const target = `/${clean}/`;
      setRedirectingTo(target);
      router.replace(target);
      return;
    }
  }, [router]);

  if (redirectingTo) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white border border-zinc-200 shadow-xs">
          <RefreshCw className="w-8 h-8 text-brass animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-zinc-950">
            در حال انتقال هوشمند به صفحه مرتبط...
          </h2>
          <p className="text-xs text-zinc-500 font-mono" dir="ltr">
            {redirectingTo}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[75vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Visual Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zinc-200 bg-white text-zinc-600 text-xs font-mono tabular-nums">
          <span>خطای سیستم</span>
          <span className="w-1.5 h-1.5 bg-brass"></span>
          <span>۴۰۴ / NOT FOUND</span>
        </div>

        {/* Heading & Details */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-obsidian tracking-tight">
            صفحه مورد نظر یافت نشد
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            متأسفانه آدرسی که وارد کرده‌اید در وب‌سایت گروه صنعتی سپنتا وجود ندارد، تغییر نام داده یا به نشانی دیگری منتقل شده است.
          </p>
        </div>

        {/* Quick Recovery Navigation */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-obsidian text-white font-medium hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 text-brass" />
            <span>بازگشت به صفحه اصلی</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link
            href="/configurator/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-zinc-300 bg-white text-zinc-900 font-medium hover:border-zinc-950 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
            <span>محاسبه‌گر فنی قیمت</span>
          </Link>

          <Link
            href="/products/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-zinc-300 bg-white text-zinc-900 font-medium hover:border-zinc-950 transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-zinc-500" />
            <span>محصولات کارخانه</span>
          </Link>

          <Link
            href="/projects/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-zinc-300 bg-white text-zinc-900 font-medium hover:border-zinc-950 transition-colors"
          >
            <span>پروژه‌ها</span>
          </Link>

          <Link
            href="/about/#contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-zinc-300 bg-white text-zinc-900 font-medium hover:border-zinc-950 transition-colors"
          >
            <Phone className="w-4 h-4 text-zinc-500" />
            <span>تماس و پشتیبانی</span>
          </Link>
        </div>

        {/* Quick Assistance Box */}
        <div className="p-4 border-s-2 border-s-brass bg-white border border-zinc-200 text-start text-xs text-zinc-600 space-y-1">
          <p className="font-bold text-zinc-900">نیاز به راهنمایی فوری دارید؟</p>
          <p>
            تیم مهندسی فروش سپنتا آماده پاسخگویی و دریافت مشخصات پروژه‌های ساختمانی شماست. شماره تماس:{" "}
            <a href="tel:02433445566" className="text-obsidian font-bold hover:text-brass">
              ۰۲۴-۳۳۴۴۵۵۶۶
            </a>{" "}
            یا مشاوره واتس‌اپ:{" "}
            <a
              href="https://wa.me/989121415500"
              className="text-eco-teal font-bold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ۰۹۱۲۱۴۱۵۵۰۰
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowUpLeft, CheckCircle2, Layers } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { PRODUCTS } from "@/data/products";
import { toPersianDigits } from "@/lib/persian-seo";
import { SITE_CONFIG } from "@/lib/site-config";

export default function Home() {
  return (
    <div className="bg-surface">
      {/* Compact Verification Header */}
      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent-hover">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>پیش‌نمایش خط لوله تصاویر محلی (AVIF/WebP) و لایه داده — زیرفاز ۱.۳</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            {SITE_CONFIG.name} — محصولات ۷گانه و سیستم‌های معماری
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            {SITE_CONFIG.tagline}
          </p>
        </div>
      </section>

      {/* 7 Product Lines Verification Grid using <PictureImage /> */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="text-xl font-bold text-ink">
              خطوط تولید ({toPersianDigits(PRODUCTS.length)} محصول اصلی)
            </h2>
          </div>

          <Link
            href="/configurator/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <span>برآورد ابعاد در کانفیگوریتور</span>
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, index) => (
            <article
              key={product.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                <PictureImage
                  imageKey={product.imageKey}
                  alt={product.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0}
                  fill
                  className="transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-ink-muted">
                      {product.category}
                    </span>
                    <span className="tabular-nums text-xs font-bold text-accent">
                      {toPersianDigits(index + 1)} / {toPersianDigits(PRODUCTS.length)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-ink">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-ink-muted">
                    {product.tagline}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <Link
                    href={`/products/${product.slug}/`}
                    className="inline-flex items-center gap-1.5 font-semibold text-accent transition-colors hover:text-accent-hover"
                  >
                    <span>مشخصات فنی محصول</span>
                    <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>

                  <span
                    dir="ltr"
                    className="font-mono text-[11px] text-ink-muted"
                  >
                    /{product.slug}/
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

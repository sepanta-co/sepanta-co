import Link from "next/link";
import { ArrowUpLeft, SlidersHorizontal } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { PRODUCTS } from "@/data/products";
import type { ProductLine } from "@/data/types";
import { toPersianDigits } from "@/lib/persian-seo";

function FlagshipPlate({
  product,
  index,
}: {
  product: ProductLine;
  index: number;
}) {
  return (
    <article className="group flex flex-col border-e border-b border-border bg-surface">
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-canvas">
        <PictureImage
          imageKey={product.imageKey}
          alt={product.name}
          sizes="(max-width: 1024px) 100vw, 50vw"
          fill
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="font-display tabular-nums absolute top-3 start-3 border border-border-strong bg-surface/95 px-2.5 py-1 text-xs font-extrabold text-anthracite">
          {toPersianDigits(index + 1).padStart(2, "۰")}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="border border-eco/25 bg-eco-soft px-2.5 py-0.5 font-bold text-eco">
              {product.category}
            </span>
            <span className="font-bold text-primary">خط تولید اصلی کارخانه</span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-anthracite">
            {product.name}
          </h3>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            {product.tagline}
          </p>

          {/* 3 Key Architectural Specs: Audio, Thermal, Profile/Thickness */}
          <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-xs">
            {product.specs.slice(0, 3).map((spec) => (
              <div
                key={spec.label}
                className="flex items-start justify-between gap-3"
              >
                <dt className="shrink-0 font-bold text-ink-muted">
                  {toPersianDigits(spec.label)}:
                </dt>
                <dd className="tabular-nums text-end font-semibold text-anthracite">
                  {toPersianDigits(spec.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Link
            href={`/products/${product.slug}/`}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[4px] border border-primary bg-surface px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white sm:text-sm"
          >
            <span>جزئیات فنی</span>
            <ArrowUpLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
          </Link>

          {product.configuratorEligible && product.configuratorKey && (
            <Link
              href={`/configurator/?product=${product.configuratorKey}`}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[4px] bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-deep sm:text-sm"
            >
              <SlidersHorizontal
                className="h-3.5 w-3.5"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span>پیکربندی این سیستم</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function SupportingIndexItem({
  product,
  index,
}: {
  product: ProductLine;
  index: number;
}) {
  return (
    <article className="group flex flex-col justify-between border-e border-b border-border bg-surface p-5 transition-colors hover:bg-surface-warm/45 sm:p-6">
      <div>
        <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden border border-border bg-canvas">
          <PictureImage
            imageKey={product.imageKey}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            fill
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="font-display tabular-nums absolute top-2.5 start-2.5 border border-border-strong bg-surface/95 px-2 py-0.5 text-[11px] font-extrabold text-anthracite">
            {toPersianDigits(index + 1).padStart(2, "۰")}
          </span>
        </div>

        <span className="inline-block border border-border bg-canvas px-2 py-0.5 text-[11px] font-bold text-ink-muted">
          {product.category}
        </span>

        <h3 className="mt-2.5 text-base font-bold text-anthracite sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
          {product.tagline}
        </p>

        <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
          {product.specs.slice(0, 2).map((spec) => (
            <div
              key={spec.label}
              className="flex items-start justify-between gap-2"
            >
              <dt className="shrink-0 text-ink-muted">
                {toPersianDigits(spec.label)}:
              </dt>
              <dd className="tabular-nums text-end font-semibold text-ink">
                {toPersianDigits(spec.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <Link
          href={`/products/${product.slug}/`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-accent-deep sm:text-sm"
        >
          <span>مشخصات فنی</span>
          <ArrowUpLeft className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
        </Link>

        {product.configuratorEligible && product.configuratorKey ? (
          <Link
            href={`/configurator/?product=${product.configuratorKey}`}
            className="inline-flex items-center gap-1 rounded-[4px] border border-border bg-canvas px-2.5 py-1.5 text-xs font-bold text-anthracite transition-colors hover:border-primary hover:text-primary"
          >
            <SlidersHorizontal
              className="h-3 w-3 text-accent-deep"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span>پیکربندی</span>
          </Link>
        ) : (
          <Link
            href="/about/#contact"
            className="text-xs font-bold text-ink-muted transition-colors hover:text-primary"
          >
            استعلام سفارش کارخانه
          </Link>
        )}
      </div>
    </article>
  );
}

export function ProductsGridSection() {
  const flagshipProducts = PRODUCTS.slice(0, 2);
  const secondaryProducts = PRODUCTS.slice(2);

  return (
    <section
      aria-labelledby="products-heading"
      className="border-b border-border bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-accent-deep" aria-hidden="true" />
              <p className="text-xs font-bold tracking-wide text-primary">
                ۰۱ — فهرست خطوط تولید کارخانه سپنتا
              </p>
            </div>
            <h2
              id="products-heading"
              className="mt-2 text-2xl font-bold text-anthracite sm:text-3xl"
            >
              ۷ سیستم تولید مستقیم درب، پنجره و حفاظت ساختمان
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
              تولید تمامی پروفیل‌های uPVC، آلومینیوم ترمال بریک و درب‌های فلزی
              و چوبی زیر یک سقف در زنجان برای هماهنگی دقیق ابعاد و تحویل
              یکپارچه پروژه.
            </p>
          </div>

          <Link
            href="/products/"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[4px] border border-border-strong bg-canvas px-4 py-2 text-sm font-bold text-anthracite transition-colors hover:border-primary hover:text-primary"
          >
            <span>کاتالوگ کامل و تعرفه روز خطوط تولید</span>
            <ArrowUpLeft
              className="h-4 w-4 text-accent-deep"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Row 1: Two Flagship Editorial Feature Plates */}
        <div className="mt-8 grid grid-cols-1 border-t border-s border-border lg:grid-cols-2">
          {flagshipProducts.map((product, idx) => (
            <FlagshipPlate key={product.slug} product={product} index={idx} />
          ))}
        </div>

        {/* Row 2: Five Supporting Production Lines Specification Index */}
        <div className="grid grid-cols-1 border-s border-border md:grid-cols-2 lg:grid-cols-3">
          {secondaryProducts.map((product, idx) => (
            <SupportingIndexItem
              key={product.slug}
              product={product}
              index={idx + 2}
            />
          ))}

          {/* Symmetrical Closing Specification Index Cell */}
          <div className="flex flex-col justify-between border-e border-b border-border bg-anthracite p-6 text-ink-inverse">
            <div>
              <span className="font-display text-xs font-bold text-amber-400">
                سفارش یکپارچه کارخانه
              </span>
              <h3 className="mt-3 text-lg font-bold text-white">
                نیاز به برآورد هم‌زمان چند خط تولید دارید؟
              </h3>
              <p className="mt-2 text-xs leading-7 text-slate-300">
                جدول بازشوها یا فایل نقشه معماری پروژه را ثبت کنید تا برآورد
                کارشناسی و زمان‌بندی تحویل کارخانه زنجان صادر شود.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 border-t border-border-dark pt-5">
              <Link
                href="/configurator/"
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[4px] bg-accent px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
              >
                <SlidersHorizontal
                  className="h-4 w-4"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span>ثبت چندآیتمی در کانفیگوریتور</span>
              </Link>
              <Link
                href="/about/#contact"
                className="inline-flex min-h-[42px] items-center justify-center rounded-[4px] border border-border-dark px-4 py-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-amber-400 hover:text-white"
              >
                ارسال نقشه به دفتر فنی زنجان
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

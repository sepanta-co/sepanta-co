import Link from "next/link";
import { ArrowUpLeft, SlidersHorizontal } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { PRODUCTS } from "@/data/products";
import type { ProductLine } from "@/data/types";

function ProductCard({
  product,
  featured = false,
  className = "",
}: {
  product: ProductLine;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent ${className}`}
    >
      <div
        className={`relative w-full overflow-hidden bg-surface-subtle ${
          featured ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        <PictureImage
          imageKey={product.imageKey}
          alt={product.name}
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          fill
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-ink-muted">
              {product.category}
            </span>
            {featured && (
              <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-hover">
                خط تولید اصلی
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-bold text-ink">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
            {product.tagline}
          </p>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
            {product.specs.slice(0, 2).map((spec) => (
              <div
                key={spec.label}
                className="flex items-start justify-between gap-3"
              >
                <dt className="shrink-0 font-medium text-ink-muted">
                  {spec.label}:
                </dt>
                <dd className="tabular-nums text-end font-semibold text-ink">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            href={`/products/${product.slug}/`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-accent"
          >
            <span>مشخصات فنی</span>
            <ArrowUpLeft className="h-4 w-4 text-accent" aria-hidden="true" />
          </Link>

          {product.configuratorEligible && product.configuratorKey && (
            <Link
              href={`/configurator/?product=${product.configuratorKey}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-hover transition-colors hover:bg-amber-200/70"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>محاسبه ابعاد</span>
            </Link>
          )}
        </div>
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
      className="border-b border-border bg-surface-subtle py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wide text-accent">
              سبد محصولات و تولیدات صنعتی
            </p>
            <h2
              id="products-heading"
              className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
            >
              ۷ خط تولید تخصصی درب، پنجره و بازشوهای معماری
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
              تامین کامل نیازهای ساختمانی از پنجره‌های عایق دوجداره و آلومینیوم
              ترمال بریک تا شیشه بالکنی، توری پلیسه، درب ضد سرقت و چهارچوب فلزی.
            </p>
          </div>

          <Link
            href="/products/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <span>فهرست کامل محصولات</span>
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Flagship 2 Window Systems */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {flagshipProducts.map((product) => (
            <ProductCard key={product.slug} product={product} featured />
          ))}
        </div>

        {/* Remaining 5 Production Lines */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {secondaryProducts.map((product, index) => {
            const spanClass =
              index < 3
                ? "lg:col-span-2"
                : index === 4
                  ? "sm:col-span-2 lg:col-span-3"
                  : "lg:col-span-3";

            return (
              <ProductCard
                key={product.slug}
                product={product}
                className={spanClass}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

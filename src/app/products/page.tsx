import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, Factory, Scale, SlidersHorizontal } from "lucide-react";
import { ProductCatalogGrid } from "@/components/products/ProductCatalogGrid";
import { ClosingCtaSection } from "@/components/sections/ClosingCtaSection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PRODUCTS } from "@/data/products";
import { buildCanonicalUrl, toPersianDigits } from "@/lib/persian-seo";

const PAGE_TITLE = "محصولات و ۷ خط تولید تخصصی";
const PAGE_DESCRIPTION =
  "کاتالوگ جامع خطوط تولید گروه صنعتی سپنتا: درب و پنجره دوجداره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی تاشو، توری پلیسه، درب ضد سرقت، درب چوبی و چهارچوب فلزی مستقیم از کارخانه زنجان.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonicalUrl("/products/"),
  },
  openGraph: {
    title: `${PAGE_TITLE} | گروه صنعتی سپنتا`,
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/products/"),
    locale: "fa_IR",
    type: "website",
  },
};

export default function ProductsCatalogPage() {
  return (
    <>
      {/* Header Band */}
      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <Breadcrumb
            items={[
              { label: "صفحه اصلی", href: "/" },
              { label: "محصولات" },
            ]}
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent-hover">
            <Factory className="h-3.5 w-3.5" aria-hidden="true" />
            <span>تولید CNC کارخانه زنجان • اندازه‌گیری و نصب سراسری</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {toPersianDigits(7)} خط تولید تخصصی گروه صنعتی سپنتا
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-ink-muted sm:text-base">
            از سیستم‌های پنجره دوجداره uPVC و آلومینیوم ترمال بریک تا شیشه بالکنی
            تاشو، توری پلیسه، درب ضد سرقت، درب داخلی چوبی و چهارچوب فلزی؛ تمامی
            محصولات بدون واسطه و با شناسنامه کنترل کیفیت از کارخانه زنجان عرضه
            می‌شوند.
          </p>
        </div>
      </section>

      {/* Interactive Catalog Filter & Grid */}
      <section
        aria-label="فهرست محصولات و خطوط تولید"
        className="border-b border-border bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductCatalogGrid products={PRODUCTS} />
        </div>
      </section>

      {/* Decision Guidance Band */}
      <section className="bg-surface-subtle py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-accent">
                <Scale className="h-4 w-4" aria-hidden="true" />
                <span>راهنمای انتخاب سیستم مناسب پروژه</span>
              </div>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">
                بین پنجره دوجداره uPVC و آلومینیوم ترمال بریک تردید دارید؟
              </h2>
              <p className="text-sm leading-7 text-ink-muted">
                در جدول مقایسه فنی، تفاوت ضریب انتقال حرارت، تحمل وزن شیشه و
                رده بودجه هر دو سیستم را بررسی کنید یا ابعاد خود را مستقیم در
                کانفیگوریتور وارد نمایید.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
              <Link
                href="/#comparison"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-subtle px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <span>مقایسه فنی uPVC و ترمال بریک</span>
                <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/configurator/"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>شروع کانفیگوریتور هوشمند</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ClosingCtaSection />
    </>
  );
}

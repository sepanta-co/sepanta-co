import React from "react";
import Link from "next/link";
import { ArrowLeft, Phone, FileText } from "lucide-react";
import { PROJECTS } from "@/data/projects";
import { StaticImage } from "@/components/ui/StaticImage";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import { ComparisonMatrix } from "@/components/home/ComparisonMatrix";
import { ConfiguratorPreview } from "@/components/home/ConfiguratorPreview";
import { toPersianDigits } from "@/lib/format";

export default function HomePage() {
  const featuredProjects = PROJECTS.filter((p) => p.isFeatured).slice(0, 4);
  const leadProject = featuredProjects[0];
  const otherProjects = featuredProjects.slice(1, 4);

  return (
    <div className="flex flex-col w-full bg-white">
      {/* 1. Full-Bleed 100svh Architectural Hero */}
      <section className="relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden bg-obsidian text-white">
        {/* Full-bleed background photography */}
        <div className="absolute inset-0 z-0">
          <StaticImage
            src="/images/hero-architecture.jpg"
            alt="معماری معاصر و پنجره‌های صنعتی سپنتا"
            fill
            priority
            className="object-cover"
          />
          {/* Localized RTL Scrim */}
          <div className="absolute inset-0 bg-gradient-to-l from-obsidian/90 via-obsidian/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-obsidian/30" />
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 sm:pt-40 pb-16 flex-1 flex flex-col justify-center">
          <div className="max-w-2xl text-start space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brass">
              <span>کارخانه تولیدی زنجان · تأسیس ۱۳۸۰</span>
            </div>

            {/* H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.3]">
              تولید صنعتی درب و پنجره؛ دقیق از خط کارخانه تا نصب در پروژه
            </h1>

            {/* Subtitle */}
            <p className="text-zinc-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
              تولید مستقیم درب و پنجره دوجداره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی تاشو و دربهای ساختمانی با ظرفیت ۱٬۰۰۰ واحد در ماه؛ تأمین و نصب استاندارد در زنجان و سراسر ایران.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/configurator/"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors focus:ring-2 focus:ring-brass focus:ring-offset-2 min-h-[44px]"
              >
                <span>پیکربندی و برآورد قیمت</span>
                <ArrowLeft className="w-4 h-4 ms-2" />
              </Link>

              <Link
                href="/products/"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-white border border-white/30 hover:bg-white/10 rounded-[2px] transition-colors min-h-[44px]"
              >
                <span>کاتالوگ ۷ خط تولید</span>
              </Link>
            </div>
          </div>
        </div>

        {/* In-flow Persona Strip above MobileBottomBar */}
        <div className="relative z-10 border-t border-white/10 bg-obsidian/75 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/10 text-xs py-3.5">
              <a
                href="#renovation"
                className="flex items-center justify-between md:justify-start gap-3 text-zinc-300 hover:text-white transition-colors py-1.5 md:py-0 px-2"
              >
                <span className="text-brass font-bold">بازسازی مسکونی:</span>
                <span>تعویض پنجره قدیمی بدون تخریب گچ و نما در یک روز</span>
                <span className="text-brass">↓</span>
              </a>

              <Link
                href="/about/#contact"
                className="flex items-center justify-between md:justify-start gap-3 text-zinc-300 hover:text-white transition-colors py-1.5 md:py-0 px-2 md:ps-6"
              >
                <span className="text-brass font-bold">پروژهها و انبوهسازان:</span>
                <span>ظرفیت ۱٬۰۰۰ واحد ماهانه و برآورد روی نقشه</span>
                <span className="text-brass">←</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive 7-Product Showcase */}
      <ProductShowcase />

      {/* 3. Obsidian Factory Authority Band 6/6 Split */}
      <section className="py-20 lg:py-28 bg-obsidian text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 6 cols: Factory Image 16:10 */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/10 shadow-xl bg-zinc-900">
                <StaticImage
                  src="/images/factory-line.jpg"
                  alt="خط تولید ماشین‌آلات مکانیزه کارخانه سپنتا"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right 6 cols: Headline & 4 Single-line KPIs */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold text-brass block">
                  ظرفیت و پشتوانه کارخانه
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  بیستوپنج سال تولید پیوسته با ماشینآلات مکانیزه
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  خطوط تمام‌اتوماتیک برش و جوش چهارسر CNC، کالیبراسیون دائمی و سیستم کنترل کیفیت چندمرحله‌ای تضمین‌کننده مقاومت و هوابندی پایدار هر قطعه تولیدی است.
                </p>
              </div>

              {/* 4 Single-line KPIs using .persian-display */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight block persian-display">
                    ۱۳۸۰
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-brass block">
                    سال تأسیس در زنجان
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight block persian-display">
                    ۱٬۰۰۰ واحد
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-brass block">
                    ظرفیت تولید ماهانه
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight block persian-display">
                    ۱۰ تا ۲۵ سال
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-400 block">
                    خدمات پس از فروش کتبی
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight block persian-display">
                    سراسر ایران
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-brass block">
                    ارسال پالتایز و نصب استاندارد
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Before/After Window Replacement */}
      <div id="renovation">
        <BeforeAfterSlider />
      </div>

      {/* 5. Clean Comparison Matrix */}
      <ComparisonMatrix />

      {/* 6. Embedded Live Configurator Preview */}
      <ConfiguratorPreview />

      {/* 7. Projects Mosaic */}
      <section className="py-20 lg:py-28 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-brass block">
                نمونهکارهای اجراشده
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                از بازسازی مسکونی زنجان تا برجها و ویلاهای کشور
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                مجموعه‌ای از پروژه‌های شاخص مهندسی و اجرایی سپنتا در شرایط اقلیمی گوناگون.
              </p>
            </div>

            <Link
              href="/projects/"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brass hover:underline shrink-0"
            >
              <span>مشاهده همه پروژه‌ها ({toPersianDigits(PROJECTS.length)})</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Lead Project in 7/5 Split */}
          {leadProject && (
            <div className="grid grid-cols-1 lg:grid-cols-12 border border-zinc-200 bg-zinc-50 overflow-hidden shadow-xs">
              <div className="lg:col-span-7 relative aspect-[16/10] bg-zinc-900">
                <StaticImage
                  src={leadProject.image}
                  alt={leadProject.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-bold text-brass">
                      {leadProject.city} • {leadProject.locationArea}
                    </span>
                    <span className="font-semibold tabular-nums">{leadProject.yearFa}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-950">
                    {leadProject.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {leadProject.architecturalChallenge}
                  </p>

                  <div className="bg-white p-3 border border-zinc-200 text-xs space-y-1">
                    <span className="text-zinc-500 block">سیستم اجراشده:</span>
                    <p className="font-bold text-zinc-900">{leadProject.systemUsed}</p>
                    <p className="text-brass font-semibold pt-0.5">حجم پروژه: {leadProject.estimatedUnitsFa}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/projects/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-950 hover:text-brass transition-colors"
                  >
                    <span>بررسی جزئیات فنی و راهکار اجرایی</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 3-Col Mosaic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherProjects.map((p) => (
              <div
                key={p.id}
                className="border border-zinc-200 bg-white flex flex-col justify-between hover:border-zinc-400 transition-colors shadow-xs"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 border-b border-zinc-200">
                    <StaticImage
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-bold text-brass">{p.city}</span>
                      <span className="tabular-nums font-semibold">{p.yearFa}</span>
                    </div>

                    <h4 className="text-base font-bold text-zinc-950 leading-snug">
                      {p.title}
                    </h4>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {p.architecturalChallenge}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <span className="text-[11px] text-zinc-500 block border-t border-zinc-100 pt-2.5 font-medium">
                    {p.systemUsed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Compact 8/4 Obsidian Technical Desk Closing Band */}
      <section className="py-16 lg:py-20 bg-obsidian text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 8 cols: Technical Sales Desk Info */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-brass block">
                واحد مهندسی فروش
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                ارسال نقشه معماری برای برآورد دقیق و زمانبندی تحویل
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                اگر نقشه‌های فاز دو معماری یا اندازه‌های حدودی دهانه‌ها را در اختیار دارید، تیم مهندسی سپنتا ظرف ۲۴ ساعت جدول متراژ و بهینه‌ترین مقاطع را برآورد می‌نماید.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brass" />
                  <span>دفتر کارخانه زنجان:</span>
                  <a href="tel:02433445566" className="font-bold text-white hover:text-brass">
                    <span dir="ltr" className="inline-block tabular-nums">
                      ۰۲۴-۳۳۴۴۵۵۶۶
                    </span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brass" />
                  <span>مشاوره و ارسال فایل نقشه:</span>
                  <a href="tel:09121415500" className="font-bold text-brass hover:underline">
                    <span dir="ltr" className="inline-block tabular-nums">
                      ۰۹۱۲-۱۴۱-۵۵۰۰
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* 4 cols: Call to Actions */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/configurator/"
                className="w-full inline-flex items-center justify-center py-3.5 px-5 text-sm font-bold text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors min-h-[44px]"
              >
                <FileText className="w-4 h-4 me-2" />
                <span>شروع برآورد آنلاین در استودیو</span>
              </Link>

              <Link
                href="/about/#contact"
                className="w-full inline-flex items-center justify-center py-3.5 px-5 text-sm font-semibold text-zinc-200 border border-white/20 hover:bg-white/10 rounded-[2px] transition-colors min-h-[44px]"
              >
                <span>ثبت درخواست بازدید و کارشناسی</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

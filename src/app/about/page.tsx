import React from "react";
import { COMPANY_DATA } from "@/data/company";
import { StaticImage } from "@/components/ui/StaticImage";

export const metadata = {
  title: "بیستوپنج سال تولید صنعتی درب و پنجره در زنجان",
  description:
    "شناسنامه گروه صنعتی سپنتا تأسیس ۱۳۸۰، خطوط تولید مکانیزه، گواهینامه‌های کیفی، آدرس کارخانه زنجان و راه‌های ارتباط مستقیم.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Page Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-brass block">
            هویت و شناسنامه کارخانه
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            بیستوپنج سال تولید صنعتی درب و پنجره در زنجان
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
            تولید صنعتی با ماشین‌آلات مکانیزه CNC، استاندارد ملی ایران، گواهی کیفیت RAL آلمان و تعهد به کیفیت پایدار از سال ۱۳۸۰ در زنجان و سراسر ایران.
          </p>
        </div>

        {/* Framed 16:9 Factory Photo */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900 border border-zinc-200 shadow-md">
          <StaticImage
            src="/images/factory-line.jpg"
            alt="خط تولید مکانیزه کارخانه سپنتا زنجان"
            fill
            className="object-cover"
          />
        </div>

        {/* Factory Story & Official Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-950">
              پیشینه و خط‌مشی صنعتی کارخانه
            </h2>
            <p className="text-zinc-700 leading-relaxed">
              {COMPANY_DATA.fullBio}
            </p>

            {/* Standards & Certifications */}
            <div className="pt-4 space-y-4">
              <h3 className="text-sm font-bold text-brass">
                گواهینامه‌های رسمی و استانداردهای کیفی
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COMPANY_DATA.standardsAndCertificates.map((cert, idx) => (
                  <div key={idx} className="border border-zinc-200 p-4 bg-zinc-50 space-y-1">
                    <span className="font-bold text-xs text-zinc-950 block">{cert.title}</span>
                    <span className="text-[11px] font-bold text-brass block">{cert.issuer}</span>
                    <p className="text-xs text-zinc-600 leading-relaxed">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="lg:col-span-5 border border-zinc-200 bg-zinc-50 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-zinc-950 border-b border-zinc-200 pb-3">
              شاخص‌های رسمی عملکرد کارخانه
            </h3>
            <div className="space-y-4 text-sm divide-y divide-zinc-200">
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-500">سابقه فعالیت:</span>
                <span className="font-bold text-zinc-950">۲۵ سال (۱۳۸۰ تا ۱۴۰۵)</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-zinc-500">ظرفیت فعال ماهانه:</span>
                <span className="font-bold text-zinc-950 tabular-nums">{COMPANY_DATA.stats.monthlyCapacityFa}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-zinc-500">خدمات پس از فروش:</span>
                <span className="font-bold text-emerald-700 tabular-nums">{COMPANY_DATA.stats.warrantyPeriodFa}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-zinc-500">پوشش پروژه‌ها:</span>
                <span className="font-bold text-zinc-950">{COMPANY_DATA.stats.provincesCoveredFa}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pt-2">
              خطوط ماشین‌آلات پیشرفته شامل دستگاه‌های جوش چهارسر هم‌زمان، فرز تخلیه آب اتوماتیک و دستگاه‌های استاندارد تزریق گاز آرگون شیشه دوجداره با کالیبراسیون دائمی است.
            </p>
          </div>
        </div>

        {/* Contact & Map Anchor Section */}
        <section id="contact" className="scroll-mt-28 space-y-8 border-t border-zinc-200 pt-16">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-brass block">
              ارتباط مستقیم و ارسال نقشه
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-950">
              اطلاعات تماس کارخانه و هماهنگی مهندسی
            </h2>
            <p className="text-zinc-600 text-sm">
              جهت بازدید کارگاهی، اندازه‌گیری در محل یا ارسال فایل نقشه معماری با کارشناسان سپنتا در ارتباط باشید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Direct Contact Card */}
            <div className="border border-zinc-200 p-6 sm:p-8 space-y-6 bg-white">
              <h3 className="text-lg font-bold text-zinc-950">راه‌های ارتباطی کارخانه</h3>
              <div className="space-y-4 text-sm divide-y divide-zinc-100">
                <div className="pt-2">
                  <span className="text-zinc-500 block text-xs">تلفن مستقیم دفتر مرکزی زنجان:</span>
                  <a
                    href={`tel:${COMPANY_DATA.contact.phone}`}
                    className="text-lg font-extrabold text-zinc-950 hover:text-brass transition-colors"
                  >
                    <span dir="ltr" className="inline-block tabular-nums">
                      {COMPANY_DATA.contact.phoneDisplay}
                    </span>
                  </a>
                </div>

                <div className="pt-3">
                  <span className="text-zinc-500 block text-xs">مشاوره فنی و ارسال نقشه:</span>
                  <a
                    href={`tel:${COMPANY_DATA.contact.mobileSales}`}
                    className="text-lg font-extrabold text-brass hover:underline"
                  >
                    <span dir="ltr" className="inline-block tabular-nums">
                      {COMPANY_DATA.contact.mobileSalesDisplay}
                    </span>
                  </a>
                </div>

                <div className="pt-3">
                  <span className="text-zinc-500 block text-xs">نشانی کارخانه:</span>
                  <p className="text-zinc-800 pt-0.5">{COMPANY_DATA.contact.factoryAddress}</p>
                  <span className="text-xs text-zinc-400 block pt-0.5">کد پستی: {COMPANY_DATA.contact.postalCode}</span>
                </div>

                <div className="pt-3">
                  <span className="text-zinc-500 block text-xs">ساعات کاری:</span>
                  <p className="text-zinc-700 pt-0.5">{COMPANY_DATA.contact.workingHours.weekdays}</p>
                  <p className="text-zinc-700">{COMPANY_DATA.contact.workingHours.thursday}</p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Card */}
            <div className="border border-zinc-200 p-6 sm:p-8 space-y-6 bg-zinc-50 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-950">موقعیت صنعتی زنجان</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  کارخانه سپنتا در شهرک صنعتی اشراق زنجان با دسترسی مستقیم به شریان‌های ترانزیتی قزوین، تبریز و تهران مستقر است و امکان بسته‌بندی ایمن پالتایز و ارسال فوری به تمام استان‌ها را فراهم می‌سازد.
                </p>

                <div className="bg-white p-4 border border-zinc-200 space-y-1 text-xs text-zinc-600">
                  <span className="font-bold text-zinc-900 block">پوشش خدمات اندازه‌گیری و نصب:</span>
                  <p>• شهر زنجان، ابهر، خرمدره، خدابنده و سراسر استان</p>
                  <p>• تهران، کرج، قزوین، تبریز و کلیه استان‌های کشور</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${COMPANY_DATA.contact.mobileSales}`}
                  className="flex-1 inline-flex items-center justify-center py-3.5 px-4 text-sm font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-[2px] transition-colors min-h-[44px]"
                >
                  <span>تماس مستقیم کارخانه</span>
                </a>

                <a
                  href="https://wa.me/989121415500"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[2px] transition-colors min-h-[44px]"
                >
                  <span>ارتباط در واتس‌اپ</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

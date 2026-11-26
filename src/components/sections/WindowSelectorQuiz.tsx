"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { toPersianDigits } from "@/lib/persian-seo";

type ProjectKind = "residential-retrofit" | "apartment-new" | "villa-span" | "balcony";
type EnvChallenge = "street-noise" | "winter-heat" | "max-view" | "budget";
type SpanWidth = "standard" | "wide";
type FinishLook = "classic-white" | "anthracite" | "woodgrain";

const STEP_1_PROJECT: readonly { id: ProjectKind; label: string }[] = [
  { id: "residential-retrofit", label: "تعویض در خانه مسکونی" },
  { id: "apartment-new", label: "نوسازی آپارتمان" },
  { id: "villa-span", label: "ویلا و دهانه بزرگ" },
  { id: "balcony", label: "بالکن و تراس" },
];

const STEP_2_CHALLENGE: readonly { id: EnvChallenge; label: string }[] = [
  { id: "street-noise", label: "سروصدای خیابان" },
  { id: "winter-heat", label: "سرمای زمستان و اتلاف انرژی" },
  { id: "max-view", label: "نور و دید حداکثری" },
  { id: "budget", label: "بودجه اقتصادی" },
];

const STEP_3_SPAN: readonly { id: SpanWidth; label: string; note: string }[] = [
  { id: "standard", label: "معمولی زیر ۲ متر", note: "پنجره‌های استاندارد واحد" },
  { id: "wide", label: "بزرگ بالای ۲ متر", note: "دهانه قدی، سالن یا تراس" },
];

const STEP_4_FINISH: readonly { id: FinishLook; label: string; hex: string }[] = [
  { id: "classic-white", label: "سفید کلاسیک", hex: "#FFFFFF" },
  { id: "anthracite", label: "آنتراسیت و مدرن", hex: "#262523" },
  { id: "woodgrain", label: "طرح چوب گرم", hex: "#7C4A2D" },
];

interface QuizRecommendation {
  systemTitle: string;
  systemKey: string;
  glassSpec: string;
  uValueNote: string;
  rationale: string;
  href: string;
}

function buildRecommendation(
  project: ProjectKind,
  challenge: EnvChallenge,
  span: SpanWidth,
  finish: FinishLook
): QuizRecommendation {
  if (project === "balcony") {
    return {
      systemTitle: "شیشه بالکن ریلی تاشو (سکوریت فریم‌لس)",
      systemKey: "BALCONY-GLASS",
      glassSpec: "شیشه سکوریت ۸ یا ۱۰ میلی‌متر شفاف با درزگیر مگنتی",
      uValueNote: `کاهش صدا ${toPersianDigits(20)} تا ${toPersianDigits(26)} dB · جمع‌شوندگی کامل`,
      rationale:
        "برای تبدیل بالکن و تراس به فضای چهارفصل بدون کاهش نور طبیعی و بدون تغییر نمای بیرونی، سیستم شیشه بالکنی تاشو دقیق‌ترین پاسخ است.",
      href: "/configurator/?product=balcony-glass",
    };
  }

  const useThermalBreak =
    project === "villa-span" ||
    span === "wide" ||
    challenge === "max-view";

  if (useThermalBreak) {
    const finishText =
      finish === "woodgrain"
        ? "پوشش دکورال طرح چوب مقاوم در برابر آفتاب"
        : finish === "anthracite"
          ? "رنگ پودری آنتراسیت الکترواستاتیک"
          : "رنگ الکترواستاتیک سفید معماری";

    const glassSpec =
      challenge === "street-noise" || challenge === "winter-heat"
        ? "شیشه سه‌جداره یا دوجداره لمینت + تزریق گاز آرگون"
        : "شیشه دوجداره سکوریت استاندارد ۲۴ تا ۳۲ میلی‌متر";

    return {
      systemTitle: "درب و پنجره آلومینیوم ترمال بریک (سری صنعتی ۶۰۶۳)",
      systemKey: "THERMAL-6063",
      glassSpec: `${glassSpec} · ${finishText}`,
      uValueNote: `Uw ${toPersianDigits("1.5")}–${toPersianDigits("1.8")} W/m²K · مناسب دهانه بالای ۲ متر`,
      rationale:
        project === "villa-span" || span === "wide"
          ? "در دهانه‌های عریض و قدی بالای ۲ متر، آلومینیوم ترمال بریک با تیغه پلی‌آمید PA66 وزن شیشه‌های سکوریت را بدون افتادگی لنگه و با فریم ظریف‌تر تحمل می‌کند."
          : "چنانچه بیشترین سطح شیشه‌خور و خط فریم مینیمال مدنظر شماست، ترمال بریک همراه با رنگ کوره‌ای ثبات ابعادی بلندمدت ایجاد می‌کند.",
      href: "/configurator/?product=thermal-break",
    };
  }

  const finishLabel =
    finish === "woodgrain"
      ? "روکش لمینت طرح چوب گرم"
      : finish === "anthracite"
        ? "روکش لمینت طوسی آنتراسیت"
        : "پروفیل سفید استاندارد مقاوم UV";

  const glassRecommendation =
    challenge === "street-noise"
      ? "شیشه دوجداره با شیشه‌های غیرهم‌ضخامت (۴+۶ میل) و گاز آرگون"
      : challenge === "winter-heat"
        ? "شیشه سه‌جداره یا دوجداره Low-E با تزریق گاز آرگون"
        : "شیشه دوجداره ۲۴ میلی‌متر استاندارد صنعتی";

  if (project === "residential-retrofit") {
    return {
      systemTitle: "پنجره دوجداره uPVC با فریم بازسازی (بدون تخریب)",
      systemKey: "UPVC-RETROFIT",
      glassSpec: `${glassRecommendation} · ${finishLabel}`,
      uValueNote: `Uw ${toPersianDigits("1.2")} W/m²K · کاهش صدا تا ${toPersianDigits(40)} dB`,
      rationale:
        "برای واحدهای مسکونی قابل سکونت، پروفیل بازسازی uPVC مستقیماً روی چهارچوب قبلی نصب می‌شود و بدون گردوغبار بنایی، بالاترین عایق صدا و حرارت را نسبت به هزینه ایجاد می‌کند.",
      href: "/configurator/?product=upvc",
    };
  }

  return {
    systemTitle: "درب و پنجره دوجداره uPVC چندمحفظه کارخانه‌ای",
    systemKey: "UPVC-PRO60/70",
    glassSpec: `${glassRecommendation} · ${finishLabel}`,
    uValueNote: `Uw ${toPersianDigits("1.1")}–${toPersianDigits("1.4")} W/m²K · عایق صوتی تا ${toPersianDigits(40)} dB`,
    rationale:
      challenge === "budget"
        ? "در ابعاد متعارف زیر ۲ متر، uPVC استاندارد با گالوانیزه سراسری ۱.۵ میل بیشترین بازدهی عایق‌کاری را در برابر بودجه ساخت ارائه می‌دهد."
        : "ترکیب پروفیل ۴ تا ۶ محفظه، لاستیک درزگیر EPDM و یراق دوحالته در کارخانه زنجان، اتلاف گرمایش و صدای محیط را به حداقل می‌رساند.",
    href: "/configurator/?product=upvc",
  };
}

export function WindowSelectorQuiz() {
  const [project, setProject] = useState<ProjectKind>("residential-retrofit");
  const [challenge, setChallenge] = useState<EnvChallenge>("street-noise");
  const [span, setSpan] = useState<SpanWidth>("standard");
  const [finish, setFinish] = useState<FinishLook>("classic-white");

  const recommendation = useMemo(
    () => buildRecommendation(project, challenge, span, finish),
    [project, challenge, span, finish]
  );

  const handleReset = () => {
    setProject("residential-retrofit");
    setChallenge("street-noise");
    setSpan("standard");
    setFinish("classic-white");
  };

  return (
    <section
      aria-labelledby="selector-heading"
      className="border-b border-border bg-surface-warm py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-strong pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-bronze" aria-hidden="true" />
              <p className="text-xs font-medium tracking-wide text-ink-muted">
                ۰۲ — راهنمای ۴ گامی انتخاب پنجره مناسب
              </p>
            </div>
            <h2
              id="selector-heading"
              className="mt-2 text-2xl font-bold text-charcoal sm:text-3xl"
            >
              هنوز بین سیستم‌های تولیدی مطمئن نیستید؟
            </h2>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-border-strong bg-surface px-3.5 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            <span>بازنشانی انتخاب‌ها</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 border-t border-s border-border bg-surface lg:grid-cols-12">
          {/* 4 Structured Studio Inputs (7 cols) */}
          <div className="space-y-6 border-e border-b border-border p-6 sm:p-8 lg:col-span-7">
            {/* Q1 */}
            <div>
              <p className="text-xs font-bold text-charcoal">
                ۱. نوع پروژه شما چیست؟
              </p>
              <div
                role="radiogroup"
                aria-label="نوع پروژه"
                className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {STEP_1_PROJECT.map((item) => {
                  const active = project === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setProject(item.id)}
                      className={`flex items-center justify-between gap-1.5 rounded-[3px] border px-3 py-2.5 text-start text-xs font-semibold transition-colors ${
                        active
                          ? "border-charcoal bg-charcoal text-canvas"
                          : "border-border bg-canvas text-ink hover:border-border-strong"
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && (
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-bronze"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q2 */}
            <div className="border-t border-border pt-5">
              <p className="text-xs font-bold text-charcoal">
                ۲. چالش اصلی محیط ساختمان کدام است؟
              </p>
              <div
                role="radiogroup"
                aria-label="چالش اصلی محیط"
                className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {STEP_2_CHALLENGE.map((item) => {
                  const active = challenge === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setChallenge(item.id)}
                      className={`flex items-center justify-between gap-1.5 rounded-[3px] border px-3 py-2.5 text-start text-xs font-semibold transition-colors ${
                        active
                          ? "border-charcoal bg-charcoal text-canvas"
                          : "border-border bg-canvas text-ink hover:border-border-strong"
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && (
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-bronze"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q3 & Q4 Side by Side */}
            <div className="grid grid-cols-1 gap-6 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-charcoal">
                  ۳. عرض تقریبی دهانه‌ها
                </p>
                <div
                  role="radiogroup"
                  aria-label="عرض تقریبی دهانه‌ها"
                  className="mt-2.5 grid grid-cols-1 gap-2"
                >
                  {STEP_3_SPAN.map((item) => {
                    const active = span === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSpan(item.id)}
                        className={`flex items-center justify-between rounded-[3px] border px-3 py-2.5 text-start text-xs transition-colors ${
                          active
                            ? "border-charcoal bg-surface-warm font-bold text-charcoal"
                            : "border-border bg-canvas text-ink hover:border-border-strong"
                        }`}
                      >
                        <div>
                          <span className="block font-bold">{item.label}</span>
                          <span className="text-[11px] text-ink-muted">
                            {item.note}
                          </span>
                        </div>
                        {active && (
                          <Check
                            className="h-4 w-4 shrink-0 text-bronze"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-charcoal">
                  ۴. اولویت ظاهری و رنگ فریم
                </p>
                <div
                  role="radiogroup"
                  aria-label="اولویت ظاهری"
                  className="mt-2.5 grid grid-cols-1 gap-2"
                >
                  {STEP_4_FINISH.map((item) => {
                    const active = finish === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFinish(item.id)}
                        className={`flex items-center justify-between rounded-[3px] border px-3 py-2 text-start text-xs transition-colors ${
                          active
                            ? "border-charcoal bg-surface-warm font-bold text-charcoal"
                            : "border-border bg-canvas text-ink hover:border-border-strong"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 font-bold">
                          <span
                            aria-hidden="true"
                            className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-border-strong"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span>{item.label}</span>
                        </span>
                        {active && (
                          <Check
                            className="h-3.5 w-3.5 shrink-0 text-bronze"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Grounded Engineering Recommendation Output (5 cols) */}
          <div className="flex flex-col justify-between border-e border-b border-border bg-charcoal p-6 text-canvas sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border-dark pb-3">
                <span className="text-xs font-bold text-bronze">
                  جمع‌بندی پیشنهاد مهندسی سپنتا
                </span>
                <span
                  dir="ltr"
                  className="font-mono text-[11px] font-bold text-ink-subtle"
                >
                  {recommendation.systemKey}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold leading-8 text-canvas sm:text-xl">
                {recommendation.systemTitle}
              </h3>

              <p className="mt-3 text-sm leading-7 text-border-strong">
                {recommendation.rationale}
              </p>

              <dl className="mt-5 space-y-3 border-t border-border-dark pt-4 text-xs">
                <div>
                  <dt className="font-bold text-ink-subtle">شیشه و پوشش پیشنهادی:</dt>
                  <dd className="mt-1 font-semibold text-canvas">
                    {recommendation.glassSpec}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-subtle">شاخص عملکرد فنی:</dt>
                  <dd className="tabular-nums mt-1 font-bold text-canvas">
                    {recommendation.uValueNote}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-7 flex flex-col gap-2.5 border-t border-border-dark pt-5">
              <Link
                href={recommendation.href}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[3px] bg-canvas px-5 py-3 text-xs font-semibold text-charcoal transition-colors hover:bg-surface-warm sm:text-sm"
              >
                <SlidersHorizontal
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span>ورود مستقیم به پیکربندی این سیستم</span>
                <ArrowUpLeft
                  className="h-4 w-4 shrink-0 text-bronze"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

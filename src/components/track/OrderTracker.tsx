"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Paperclip,
  Search,
  XCircle,
} from "lucide-react";
import {
  FRAME_FINISHES,
  GLASS_OPTIONS,
  OPENING_LABELS,
  SYSTEM_RULES,
  type ConfiguratorSystemKey,
  type FrameFinishKey,
  type GlassOptionKey,
  type OpeningType,
} from "@/lib/configurator-rules";
import { toLatinDigits, toPersianDigits } from "@/lib/persian-seo";
import { formatToman } from "@/lib/pricing-calculator";
import {
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUS_STEPS,
} from "@/lib/tracking";

interface TrackedItem {
  locationName?: string;
  system: ConfiguratorSystemKey;
  widthCm: number;
  heightCm: number;
  panelCount?: number;
  openings?: OpeningType[];
  glassType: GlassOptionKey;
  finish: FrameFinishKey;
  includeMesh?: boolean;
  quantity: number;
  breakdown?: {
    totalIrr: number;
  };
}

interface TrackedInquiry {
  trackingCode: string;
  customerName: string;
  maskedPhone: string;
  city: string;
  projectType: string;
  status: string;
  items: TrackedItem[];
  estimatedTotalIrr: number;
  hasAttachment: boolean;
  attachmentName: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatPersianDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function OrderTracker() {
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get("code") || "").trim().toUpperCase();

  return <OrderTrackerInner key={initialCode} initialCode={initialCode} />;
}

function OrderTrackerInner({ initialCode }: { initialCode: string }) {
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [phoneVerify, setPhoneVerify] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState<TrackedInquiry | null>(null);

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const cleanCode = toLatinDigits(trackingCode).trim().toUpperCase();
    const cleanPhone = toLatinDigits(phoneVerify).replace(/[\s\-()]/g, "");

    if (!cleanCode || !cleanPhone) {
      setError("لطفاً کد رهگیری و شماره تماس (یا ۴ رقم آخر) را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/track/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingCode: cleanCode,
          phoneVerify: cleanPhone,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        inquiry?: TrackedInquiry;
      };

      if (!res.ok || !data.ok || !data.inquiry) {
        setInquiry(null);
        setError(
          data.error || "درخواستی با این کد رهگیری و شماره تماس یافت نشد."
        );
        return;
      }

      setInquiry(data.inquiry);
    } catch {
      setError("خطا در برقراری ارتباط با سامانه؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const activeStepIndex = inquiry
    ? INQUIRY_STATUS_STEPS.findIndex((s) => s.key === inquiry.status)
    : -1;

  return (
    <div className="space-y-8">
      {/* Lookup Form */}
      <form
        onSubmit={handleLookup}
        noValidate
        className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="track-code"
              className="block text-xs font-semibold text-ink"
            >
              کد رهگیری سفارش *
            </label>
            <input
              id="track-code"
              type="text"
              dir="ltr"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="SPN-XXXXXX"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-end font-mono text-sm font-bold uppercase text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="md:col-span-5">
            <label
              htmlFor="track-phone"
              className="block text-xs font-semibold text-ink"
            >
              شماره تماس کامل یا ۴ رقم آخر شماره *
            </label>
            <input
              id="track-phone"
              type="tel"
              dir="ltr"
              value={phoneVerify}
              onChange={(e) => setPhoneVerify(e.target.value)}
              placeholder="مثلاً 6789 یا 09123456789"
              className="tabular-nums mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-end text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>{loading ? "بررسی..." : "پیگیری"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 sm:text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Tracking Result */}
      {inquiry && (
        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  dir="ltr"
                  className="rounded-lg bg-surface-dark px-3 py-1 font-mono text-sm font-bold text-amber-400"
                >
                  {inquiry.trackingCode}
                </span>
                <span className="rounded-lg bg-accent-soft px-3 py-1 text-xs font-bold text-accent-hover">
                  {INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}
                </span>
              </div>

              <h2 className="mt-3 text-xl font-extrabold text-ink">
                {inquiry.customerName} — {inquiry.city}
              </h2>
              <p className="mt-1 text-xs text-ink-muted sm:text-sm">
                نوع درخواست: {inquiry.projectType} • شماره ثبت‌شده:{" "}
                <span dir="ltr" className="tabular-nums font-semibold">
                  {toPersianDigits(inquiry.maskedPhone)}
                </span>
              </p>
            </div>

            <div className="text-start sm:text-end">
              <p className="text-xs text-ink-muted">
                تاریخ ثبت: {formatPersianDate(inquiry.createdAt)}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                آخرین بروزرسانی: {formatPersianDate(inquiry.updatedAt)}
              </p>
              {inquiry.estimatedTotalIrr > 0 && (
                <p className="tabular-nums mt-2 text-base font-extrabold text-accent-hover">
                  برآورد سامانه: {formatToman(inquiry.estimatedTotalIrr)}
                </p>
              )}
            </div>
          </div>

          {/* 6-Stage Architectural Timeline or Cancelled Notice */}
          {inquiry.status === "cancelled" ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">این درخواست لغو شده است</p>
                <p className="mt-1 text-xs leading-6">
                  در صورت نیاز به پیگیری یا ثبت درخواست جدید، می‌توانید با واحد
                  فروش کارخانه تماس بگیرید یا از کانفیگوریتور استفاده کنید.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold text-ink sm:text-base">
                مراحل پیشرفت پرونده در کارخانه سپنتا
              </h3>

              <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
                {INQUIRY_STATUS_STEPS.map((step, index) => {
                  const isDone = activeStepIndex > index;
                  const isCurrent = activeStepIndex === index;
                  return (
                    <li
                      key={step.key}
                      className={`rounded-xl border p-3.5 transition-colors ${
                        isCurrent
                          ? "border-accent bg-accent-soft/70"
                          : isDone
                            ? "border-emerald-200 bg-emerald-50/60"
                            : "border-border bg-surface-subtle opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="tabular-nums text-xs font-bold text-ink-muted">
                          مرحله {toPersianDigits(index + 1)}
                        </span>
                        {isDone ? (
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-700"
                            aria-hidden="true"
                          />
                        ) : isCurrent ? (
                          <Clock
                            className="h-4 w-4 text-accent"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs font-bold text-ink">
                        {step.label}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                        {step.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Attachment Confirmation Badge */}
          {inquiry.hasAttachment && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-xs text-ink">
              <Paperclip className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                فایل نقشه / تصویر پیوست‌شده در سیستم کارخانه ثبت شده است:{" "}
                <strong dir="ltr" className="font-mono">
                  {inquiry.attachmentName || "فایل پیوست"}
                </strong>
              </span>
            </div>
          )}

          {/* Itemized Summary */}
          {inquiry.items.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink sm:text-base">
                جزئیات اقلام ثبت‌شده ({toPersianDigits(inquiry.items.length)}{" "}
                ردیف)
              </h3>
              <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface-subtle">
                {inquiry.items.map((item, idx) => {
                  const sysLabel =
                    SYSTEM_RULES[item.system]?.shortLabel ?? item.system;
                  const glassLabel =
                    GLASS_OPTIONS[item.glassType]?.shortLabel ?? item.glassType;
                  const finishLabel =
                    FRAME_FINISHES[item.finish]?.label ?? item.finish;
                  return (
                    <div
                      key={`${item.system}-${idx}`}
                      className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {toPersianDigits(idx + 1)}.{" "}
                          {item.locationName || "دهانه"} — {sysLabel}
                        </p>
                        <p className="tabular-nums mt-1 text-xs text-ink-muted">
                          ابعاد: {toPersianDigits(item.widthCm)} ×{" "}
                          {toPersianDigits(item.heightCm)} سم •{" "}
                          {toPersianDigits(item.quantity)} عدد
                          {item.openings && item.openings.length > 0
                            ? ` • بازشو: ${item.openings
                                .map((o) => OPENING_LABELS[o] ?? o)
                                .join(" + ")}`
                            : ""}{" "}
                          • {glassLabel} • {finishLabel}
                        </p>
                      </div>
                      {item.breakdown?.totalIrr ? (
                        <p className="tabular-nums text-xs font-bold text-accent-hover sm:text-sm">
                          {formatToman(item.breakdown.totalIrr)}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-ink-muted">
            <span>سوالی درباره وضعیت سفارش خود دارید؟</span>
            <Link
              href="/about/#contact"
              className="font-semibold text-accent hover:text-accent-hover"
            >
              تماس با دفتر فنی و فروش کارخانه
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

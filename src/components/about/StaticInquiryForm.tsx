"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, RotateCcw, Send } from "lucide-react";
import { toLatinDigits, toPersianDigits } from "@/lib/persian-seo";
import { SITE_CONFIG } from "@/lib/site-config";

export interface StaticInquiryFormProps {
  productOptions: string[];
}

interface FormState {
  fullName: string;
  phone: string;
  city: string;
  needType: string;
  approxSize: string;
  notes: string;
  website: string;
}

const RETROFIT_OPTION = "تعویض پنجره قدیمی بدون تخریب";

export function StaticInquiryForm({ productOptions }: StaticInquiryFormProps) {
  const options = [...productOptions, RETROFIT_OPTION];

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    city: "",
    needType: options[0] ?? RETROFIT_OPTION,
    approxSize: "",
    notes: "",
    website: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    trackingCode: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "لطفاً نام و نام خانوادگی خود را وارد کنید.";
    }

    const normalizedPhone = toLatinDigits(form.phone).replace(/[\s\-()]/g, "");
    if (!/^0[0-9]{10}$/.test(normalizedPhone)) {
      nextErrors.phone =
        "شماره تماس معتبر با پیش‌شماره (۱۱ رقم، مثلاً ۰۹۱۲ یا ۰۲۴) وارد کنید.";
    }

    if (form.city.trim().length < 2) {
      nextErrors.city = "لطفاً شهر محل اجرا را وارد کنید.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    if (!validate()) return;

    const normalizedPhone = toLatinDigits(form.phone).replace(/[\s\-()]/g, "");
    const combinedNotes = [
      form.approxSize.trim()
        ? `متراژ / تعداد تقریبی: ${form.approxSize.trim()}`
        : null,
      form.notes.trim() ? form.notes.trim() : null,
    ]
      .filter(Boolean)
      .join(" | ");

    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.fullName.trim(),
          phone: normalizedPhone,
          city: form.city.trim(),
          projectType: form.needType,
          notes: combinedNotes,
          items: [],
          website: form.website,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        trackingCode?: string;
      };

      if (!response.ok || !data.ok || !data.trackingCode) {
        setServerError(
          data.error || "ثبت درخواست با خطا مواجه شد؛ لطفاً دوباره تلاش کنید."
        );
        return;
      }

      const lines = [
        `درخواست مشاوره و استعلام فنی — ${SITE_CONFIG.name}`,
        `کد رهگیری سامانه: ${data.trackingCode}`,
        `نام و نام خانوادگی: ${form.fullName.trim()}`,
        `شماره تماس: ${toPersianDigits(normalizedPhone)}`,
        `شهر پروژه: ${form.city.trim()}`,
        `نوع نیاز: ${form.needType}`,
        form.approxSize.trim()
          ? `متراژ / تعداد تقریبی: ${toPersianDigits(form.approxSize.trim())}`
          : null,
        form.notes.trim() ? `توضیحات: ${form.notes.trim()}` : null,
      ].filter(Boolean);

      setSubmittedData({
        trackingCode: data.trackingCode,
        message: lines.join("\n"),
      });
      setCopied(false);
      setCodeCopied(false);
    } catch {
      setServerError("ارتباط با سرور برقرار نشد؛ لطفاً دقایقی دیگر تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!submittedData) return;
    try {
      await navigator.clipboard.writeText(submittedData.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const handleCopyCode = async () => {
    if (!submittedData) return;
    try {
      await navigator.clipboard.writeText(submittedData.trackingCode);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 3000);
    } catch {
      setCodeCopied(false);
    }
  };

  if (submittedData) {
    const whatsappUrl = `${SITE_CONFIG.contact.whatsappHref}?text=${encodeURIComponent(
      submittedData.message
    )}`;

    return (
      <div className="rounded-2xl border border-amber-300 bg-surface p-6 shadow-xs sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1 text-xs font-bold text-accent-hover">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>درخواست شما با موفقیت در سامانه کارخانه ثبت شد</span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-ink">
          کد رهگیری شما صادر شد
        </h3>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle p-4">
          <div>
            <p className="text-xs text-ink-muted">کد رهگیری اختصاصی</p>
            <p
              dir="ltr"
              className="mt-1 font-mono text-xl font-extrabold tracking-wider text-ink"
            >
              {submittedData.trackingCode}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink hover:border-accent"
            >
              {codeCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                  <span>کپی کد</span>
                </>
              )}
            </button>

            <Link
              href={`/track/?code=${submittedData.trackingCode}`}
              className="inline-flex items-center rounded-lg bg-surface-dark px-3.5 py-2 text-xs font-semibold text-ink-inverse hover:bg-surface-elevated"
            >
              پیگیری وضعیت درخواست
            </Link>
          </div>
        </div>

        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-surface-subtle p-4 font-sans text-xs leading-7 text-ink sm:text-sm">
          {submittedData.message}
        </pre>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span>ارسال در واتساپ کارخانه</span>
          </a>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>متن استعلام کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                <span>کپی متن استعلام</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubmittedData(null)}
            className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>ثبت درخواست دیگر</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8"
    >
      <div>
        <h3 className="text-lg font-bold text-ink">
          ثبت رسمی درخواست مشاوره و استعلام کارخانه
        </h3>
        <p className="mt-1 text-xs leading-6 text-ink-muted">
          با ثبت این فرم، درخواست شما در سامانه کارخانه زنجان ذخیره شده و کد
          رهگیری اختصاصی برای پیگیری وضعیت صادر می‌شود.
        </p>
      </div>

      {/* Honeypot anti-spam field */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="inquiry-name"
            className="block text-xs font-semibold text-ink"
          >
            نام و نام خانوادگی *
          </label>
          <input
            id="inquiry-name"
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="مثلاً: مهندس علی محمدی"
            aria-invalid={Boolean(errors.fullName)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
          />
          {errors.fullName && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="inquiry-phone"
            className="block text-xs font-semibold text-ink"
          >
            شماره تماس *
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="09120000000"
            aria-invalid={Boolean(errors.phone)}
            className="tabular-nums mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-end text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="inquiry-city"
            className="block text-xs font-semibold text-ink"
          >
            شهر پروژه *
          </label>
          <input
            id="inquiry-city"
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="مثلاً: زنجان / تهران / کرج"
            aria-invalid={Boolean(errors.city)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
          />
          {errors.city && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="inquiry-need"
            className="block text-xs font-semibold text-ink"
          >
            نوع محصول یا خدمت
          </label>
          <select
            id="inquiry-need"
            value={form.needType}
            onChange={(e) => setForm({ ...form, needType: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="inquiry-size"
          className="block text-xs font-semibold text-ink"
        >
          متراژ یا تعداد تقریبی دهانه‌ها (اختیاری)
        </label>
        <input
          id="inquiry-size"
          type="text"
          value={form.approxSize}
          onChange={(e) => setForm({ ...form, approxSize: e.target.value })}
          placeholder="مثلاً: ۶ پنجره مسکونی یا حدود ۱۸ مترمربع"
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="inquiry-notes"
          className="block text-xs font-semibold text-ink"
        >
          توضیحات کوتاه (اختیاری)
        </label>
        <textarea
          id="inquiry-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="مثلاً: نیاز به شیشه سه‌جداره، رنگ آنتراسیت یا تعویض بدون تخریب..."
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none"
        />
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 sm:text-sm"
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span>
          {submitting
            ? "در حال ثبت در سامانه..."
            : "ثبت رسمی درخواست و دریافت کد رهگیری"}
        </span>
      </button>
    </form>
  );
}

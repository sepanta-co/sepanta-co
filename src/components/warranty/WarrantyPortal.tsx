"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Search,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { toLatinDigits, toPersianDigits } from "@/lib/persian-seo";
import {
  SERVICE_REQUEST_TYPE_LABELS,
  WARRANTY_STATUS_LABELS,
} from "@/lib/tracking";

interface WarrantyCertificate {
  serialCode: string;
  customerName: string;
  maskedPhone: string;
  city: string;
  systemName: string;
  warrantyYears: number;
  issuedDate: string;
  expiresDate: string;
  status: string;
}

interface ServiceRequestItem {
  trackingCode: string;
  requestType: string;
  description: string;
  status: string;
  createdAt: string;
}

export function WarrantyPortal() {
  const [serialCode, setSerialCode] = useState("");
  const [phoneVerify, setPhoneVerify] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [warranty, setWarranty] = useState<WarrantyCertificate | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestItem[]>(
    []
  );

  // Verified credentials kept for submitting service requests
  const [verifiedAuth, setVerifiedAuth] = useState<{
    serialCode: string;
    phoneVerify: string;
  } | null>(null);

  const [requestType, setRequestType] = useState<
    "adjustment" | "inspection" | "hardware"
  >("adjustment");
  const [description, setDescription] = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSuccessCode, setServiceSuccessCode] = useState<string | null>(
    null
  );

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLookupError(null);
    setServiceError(null);
    setServiceSuccessCode(null);

    const cleanSerial = toLatinDigits(serialCode).trim().toUpperCase();
    const cleanPhone = toLatinDigits(phoneVerify).replace(/[\s\-()]/g, "");

    if (!cleanSerial || !cleanPhone) {
      setLookupError(
        "لطفاً شماره سریال ضمانت‌نامه و شماره تماس ثبت‌شده را وارد کنید."
      );
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch("/api/warranty/lookup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialCode: cleanSerial,
          phoneVerify: cleanPhone,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        warranty?: WarrantyCertificate;
        serviceRequests?: ServiceRequestItem[];
      };

      if (!res.ok || !data.ok || !data.warranty) {
        setWarranty(null);
        setServiceRequests([]);
        setVerifiedAuth(null);
        setLookupError(
          data.error || "ضمانت‌نامه‌ای با این مشخصات یافت نشد."
        );
        return;
      }

      setWarranty(data.warranty);
      setServiceRequests(data.serviceRequests ?? []);
      setVerifiedAuth({
        serialCode: cleanSerial,
        phoneVerify: cleanPhone,
      });
    } catch {
      setLookupError("خطا در برقراری ارتباط با سامانه؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleServiceSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!verifiedAuth || !warranty) return;

    setServiceError(null);
    setServiceSuccessCode(null);

    if (description.trim().length < 10) {
      setServiceError(
        "لطفاً شرح وضعیت یا نیاز رگلاژ را حداقل در ۱۰ کاراکتر بنویسید."
      );
      return;
    }

    setServiceLoading(true);
    try {
      const res = await fetch("/api/warranty/service/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialCode: verifiedAuth.serialCode,
          phoneVerify: verifiedAuth.phoneVerify,
          requestType,
          description: description.trim(),
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        serviceTrackingCode?: string;
        createdAt?: string;
      };

      if (!res.ok || !data.ok || !data.serviceTrackingCode) {
        setServiceError(
          data.error || "ثبت درخواست خدمات با خطا مواجه شد."
        );
        return;
      }

      setServiceSuccessCode(data.serviceTrackingCode);
      setServiceRequests((prev) => [
        {
          trackingCode: data.serviceTrackingCode!,
          requestType,
          description: description.trim(),
          status: "open",
          createdAt: data.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);
      setDescription("");
    } catch {
      setServiceError("خطا در ارتباط با سامانه؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setServiceLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Warranty Lookup Form */}
      <form
        onSubmit={handleLookup}
        noValidate
        className="border border-border bg-surface p-6 sm:p-8"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
          <h2 className="text-lg font-extrabold text-ink">
            استعلام اصالت ضمانت‌نامه ۱۰ تا ۲۵ ساله سپنتا
          </h2>
        </div>
        <p className="mt-1.5 text-xs leading-6 text-ink-muted sm:text-sm">
          شماره سریال درج‌شده روی شناسنامه فنی پنجره (مثلاً{" "}
          <span dir="ltr" className="font-mono font-semibold">
            SPN-W-1404-1001
          </span>
          ) و شماره تماس کارفرما (یا ۴ رقم آخر آن) را وارد کنید.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="warranty-serial"
              className="block text-xs font-bold text-ink"
            >
              شماره سریال ضمانت‌نامه *
            </label>
            <input
              id="warranty-serial"
              type="text"
              dir="ltr"
              value={serialCode}
              onChange={(e) => setSerialCode(e.target.value)}
              placeholder="SPN-W-1404-1001"
              className="mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-3 text-end font-mono text-sm font-bold uppercase text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="md:col-span-5">
            <label
              htmlFor="warranty-phone"
              className="block text-xs font-bold text-ink"
            >
              شماره تماس ثبت‌شده یا ۴ رقم آخر *
            </label>
            <input
              id="warranty-phone"
              type="tel"
              dir="ltr"
              value={phoneVerify}
              onChange={(e) => setPhoneVerify(e.target.value)}
              placeholder="مثلاً 1001 یا 09120001001"
              className="tabular-nums mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-3 text-end text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={lookupLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-brand px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>{lookupLoading ? "بررسی..." : "استعلام"}</span>
            </button>
          </div>
        </div>

        {lookupError && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 sm:text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{lookupError}</span>
          </div>
        )}
      </form>

      {/* 2. Verified Digital Warranty Certificate + Service Request Form */}
      {warranty && (
        <div className="space-y-8">
          {/* Official Digital Certificate */}
          <div className="border border-border-dark bg-surface-dark p-6 text-ink-inverse sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-dark pb-6">
              <div>
                <div className="inline-flex items-center gap-2 border border-border-dark bg-surface-elevated px-3 py-1 text-xs font-bold text-amber-400">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>ضمانت‌نامه معتبر ثبت‌شده در کارخانه زنجان</span>
                </div>
                <h3 className="mt-3 text-xl font-extrabold text-ink-inverse">
                  {warranty.customerName}
                </h3>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                  سیستم اجراشده: {warranty.systemName}
                </p>
              </div>

              <div className="text-start sm:text-end">
                <p
                  dir="ltr"
                  className="font-mono text-lg font-extrabold text-amber-400"
                >
                  {warranty.serialCode}
                </p>
                <span className="mt-1 inline-block border border-emerald-800 bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  {WARRANTY_STATUS_LABELS[warranty.status] ?? warranty.status}
                </span>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 border-t border-s border-border-dark sm:grid-cols-4">
              <div className="border-e border-b border-border-dark bg-surface-elevated p-3.5">
                <dt className="text-xs text-slate-400">مدت پوشش گارانتی</dt>
                <dd className="tabular-nums mt-1 text-sm font-bold text-ink-inverse">
                  {toPersianDigits(warranty.warrantyYears)} سال
                </dd>
              </div>
              <div className="border-e border-b border-border-dark bg-surface-elevated p-3.5">
                <dt className="text-xs text-slate-400">تاریخ صدور</dt>
                <dd className="tabular-nums mt-1 text-sm font-bold text-ink-inverse">
                  {toPersianDigits(warranty.issuedDate)}
                </dd>
              </div>
              <div className="border-e border-b border-border-dark bg-surface-elevated p-3.5">
                <dt className="text-xs text-slate-400">تاریخ اعتبار</dt>
                <dd className="tabular-nums mt-1 text-sm font-bold text-ink-inverse">
                  {toPersianDigits(warranty.expiresDate)}
                </dd>
              </div>
              <div className="border-e border-b border-border-dark bg-surface-elevated p-3.5">
                <dt className="text-xs text-slate-400">شهر و شماره</dt>
                <dd className="tabular-nums mt-1 text-sm font-bold text-ink-inverse">
                  {warranty.city} ({toPersianDigits(warranty.maskedPhone)})
                </dd>
              </div>
            </dl>
          </div>

          {/* 3. After-Sales Service / Adjustment Request Form */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleServiceSubmit}
              noValidate
              className="space-y-5 border border-border bg-surface p-6 sm:p-8 lg:col-span-7"
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="h-5 w-5 text-brand" aria-hidden="true" />
                <h3 className="text-lg font-extrabold text-ink">
                  ثبت درخواست خدمات پس از فروش و رگلاژ رایگان
                </h3>
              </div>

              {serviceSuccessCode && (
                <div className="border border-eco/25 bg-eco-soft p-4 text-xs leading-6 text-ink sm:text-sm">
                  <p className="font-bold text-eco">
                    درخواست خدمات شما با موفقیت ثبت شد.
                  </p>
                  <p className="mt-1">
                    کد رهگیری خدمات:{" "}
                    <span dir="ltr" className="font-mono font-extrabold">
                      {serviceSuccessCode}
                    </span>
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="service-type"
                  className="block text-xs font-bold text-ink"
                >
                  نوع درخواست خدمات
                </label>
                <select
                  id="service-type"
                  value={requestType}
                  onChange={(e) =>
                    setRequestType(
                      e.target.value as "adjustment" | "inspection" | "hardware"
                    )
                  }
                  className="mt-1.5 w-full rounded-[2px] border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
                >
                  <option value="adjustment">
                    {SERVICE_REQUEST_TYPE_LABELS.adjustment}
                  </option>
                  <option value="inspection">
                    {SERVICE_REQUEST_TYPE_LABELS.inspection}
                  </option>
                  <option value="hardware">
                    {SERVICE_REQUEST_TYPE_LABELS.hardware}
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="service-desc"
                  className="block text-xs font-bold text-ink"
                >
                  شرح مشکل یا موقعیت لنگه نیازمند رگلاژ *
                </label>
                <textarea
                  id="service-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثلاً: لنگه پنجره اتاق خواب هنگام بستن به فریم پایین گیر می‌کند..."
                  className="mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              {serviceError && (
                <div
                  role="alert"
                  className="border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                >
                  {serviceError}
                </div>
              )}

              <button
                type="submit"
                disabled={serviceLoading || warranty.status !== "active"}
                className="inline-flex items-center gap-2 rounded-[2px] bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>
                  {serviceLoading
                    ? "در حال ثبت درخواست..."
                    : "ثبت درخواست رگلاژ و خدمات"}
                </span>
              </button>
            </form>

            {/* Previous Service Requests */}
            <div className="border border-border bg-surface-subtle p-6 lg:col-span-5">
              <h3 className="text-base font-extrabold text-ink">
                سوابق خدمات ثبت‌شده ({toPersianDigits(serviceRequests.length)})
              </h3>

              {serviceRequests.length === 0 ? (
                <p className="mt-3 text-xs leading-6 text-ink-muted sm:text-sm">
                  تاکنون درخواست خدماتی برای این ضمانت‌نامه ثبت نشده است.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {serviceRequests.map((req) => (
                    <li
                      key={req.trackingCode}
                      className="border border-border bg-surface p-4 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          dir="ltr"
                          className="font-mono font-bold text-brand"
                        >
                          {req.trackingCode}
                        </span>
                        <span className="border border-border bg-surface-subtle px-2 py-0.5 font-bold text-ink">
                          {req.status === "open" ? "در انتظار بررسی" : req.status}
                        </span>
                      </div>
                      <p className="mt-2 font-bold text-ink">
                        {SERVICE_REQUEST_TYPE_LABELS[req.requestType] ??
                          req.requestType}
                      </p>
                      <p className="mt-1 leading-6 text-ink-muted">
                        {req.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

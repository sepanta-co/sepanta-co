"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  FRAME_FINISHES,
  GLASS_OPTIONS,
  SYSTEM_RULES,
  type ConfiguratorSystemKey,
  type FrameFinishKey,
  type GlassOptionKey,
} from "@/lib/configurator-rules";
import { toPersianDigits } from "@/lib/persian-seo";
import { formatToman, type PricingRuleRow } from "@/lib/pricing-calculator";
import {
  INQUIRY_STATUS_LABELS,
  SERVICE_REQUEST_TYPE_LABELS,
  WARRANTY_STATUS_LABELS,
} from "@/lib/tracking";

interface SessionState {
  authenticated: boolean;
  username?: string;
}

interface AdminInquiryItem {
  locationName?: string;
  system: ConfiguratorSystemKey;
  widthCm: number;
  heightCm: number;
  glassType: GlassOptionKey;
  finish: FrameFinishKey;
  quantity: number;
  breakdown?: { totalIrr: number };
}

interface AdminInquiry {
  id: number;
  trackingCode: string;
  customerName: string;
  phone: string;
  city: string;
  projectType: string;
  items: AdminInquiryItem[];
  estimatedTotalIrr: number;
  notes: string | null;
  attachmentPath: string | null;
  attachmentOriginalName: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminWarranty {
  id: number;
  serial_code: string;
  customer_name: string;
  phone: string;
  city: string;
  system_name: string;
  warranty_years: number;
  issued_date: string;
  expires_date: string;
  status: string;
  notes: string | null;
}

interface AdminServiceRequest {
  id: number;
  warranty_id: number;
  tracking_code: string;
  request_type: string;
  description: string;
  status: string;
  created_at: string;
  serial_code: string;
  customer_name: string;
  phone: string;
  city: string;
}

type AdminTab = "inquiries" | "pricing" | "warranties";

function formatFaDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function AdminDashboard({
  initialSession,
}: {
  initialSession: SessionState;
}) {
  const [session, setSession] = useState<SessionState>(initialSession);
  const [activeTab, setActiveTab] = useState<AdminTab>("inquiries");

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Inquiries state
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [kpis, setKpis] = useState({ total: 0, newCount: 0, pipelineIrr: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [draftStatuses, setDraftStatuses] = useState<Record<number, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});
  const [savingInquiryId, setSavingInquiryId] = useState<number | null>(null);

  // Pricing rules state
  const [pricingRules, setPricingRules] = useState<PricingRuleRow[]>([]);
  const [savingPricingKey, setSavingPricingKey] = useState<string | null>(null);

  // Warranties & service requests state
  const [warranties, setWarranties] = useState<AdminWarranty[]>([]);
  const [serviceRequests, setServiceRequests] = useState<AdminServiceRequest[]>(
    []
  );
  const [newWarranty, setNewWarranty] = useState({
    customerName: "",
    phone: "",
    city: "",
    systemName: "پنجره دوجداره uPVC سری ۷۰",
    warrantyYears: "15",
    issuedDate: "1405/09/05",
    expiresDate: "1420/09/05",
    serialCode: "",
    notes: "",
  });
  const [creatingWarranty, setCreatingWarranty] = useState(false);
  const [savingServiceId, setSavingServiceId] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadInquiries = useCallback(
    async (status = statusFilter, q = searchQuery) => {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const queryStr = params.toString();
      const url = queryStr
        ? `/api/admin/inquiries/?${queryStr}`
        : "/api/admin/inquiries/";

      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 401) {
        setSession({ authenticated: false });
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        kpis?: { total: number; newCount: number; pipelineIrr: number };
        inquiries?: AdminInquiry[];
      };
      if (data.ok && data.inquiries) {
        setInquiries(data.inquiries);
        if (data.kpis) setKpis(data.kpis);
        const statuses: Record<number, string> = {};
        const notesMap: Record<number, string> = {};
        for (const inq of data.inquiries) {
          statuses[inq.id] = inq.status;
          notesMap[inq.id] = inq.adminNotes ?? "";
        }
        setDraftStatuses(statuses);
        setDraftNotes(notesMap);
      }
    },
    [statusFilter, searchQuery]
  );

  const loadPricing = useCallback(async () => {
    const res = await fetch("/api/admin/pricing-rules/", { cache: "no-store" });
    if (res.status === 401) {
      setSession({ authenticated: false });
      return;
    }
    const data = (await res.json()) as {
      ok?: boolean;
      rules?: PricingRuleRow[];
    };
    if (data.ok && data.rules) {
      setPricingRules(data.rules);
    }
  }, []);

  const loadWarranties = useCallback(async () => {
    const res = await fetch("/api/admin/warranties/", { cache: "no-store" });
    if (res.status === 401) {
      setSession({ authenticated: false });
      return;
    }
    const data = (await res.json()) as {
      ok?: boolean;
      warranties?: AdminWarranty[];
      serviceRequests?: AdminServiceRequest[];
    };
    if (data.ok) {
      setWarranties(data.warranties ?? []);
      setServiceRequests(data.serviceRequests ?? []);
    }
  }, []);

  useEffect(() => {
    if (!session.authenticated) return;
    let active = true;

    Promise.all([
      fetch("/api/admin/inquiries/", { cache: "no-store" }),
      fetch("/api/admin/pricing-rules/", { cache: "no-store" }),
      fetch("/api/admin/warranties/", { cache: "no-store" }),
    ])
      .then(async ([inqRes, priceRes, warRes]) => {
        if (!active) return;
        if (
          inqRes.status === 401 ||
          priceRes.status === 401 ||
          warRes.status === 401
        ) {
          setSession({ authenticated: false });
          return;
        }

        const [inqData, priceData, warData] = (await Promise.all([
          inqRes.json(),
          priceRes.json(),
          warRes.json(),
        ])) as [
          {
            ok?: boolean;
            kpis?: { total: number; newCount: number; pipelineIrr: number };
            inquiries?: AdminInquiry[];
          },
          { ok?: boolean; rules?: PricingRuleRow[] },
          {
            ok?: boolean;
            warranties?: AdminWarranty[];
            serviceRequests?: AdminServiceRequest[];
          },
        ];

        if (!active) return;

        if (inqData.ok && inqData.inquiries) {
          setInquiries(inqData.inquiries);
          if (inqData.kpis) setKpis(inqData.kpis);
          const statuses: Record<number, string> = {};
          const notesMap: Record<number, string> = {};
          for (const inq of inqData.inquiries) {
            statuses[inq.id] = inq.status;
            notesMap[inq.id] = inq.adminNotes ?? "";
          }
          setDraftStatuses(statuses);
          setDraftNotes(notesMap);
        }

        if (priceData.ok && priceData.rules) {
          setPricingRules(priceData.rules);
        }

        if (warData.ok) {
          setWarranties(warData.warranties ?? []);
          setServiceRequests(warData.serviceRequests ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setFeedback({
            type: "error",
            text: "خطا در دریافت اطلاعات پنل مدیریت.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [session.authenticated]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        username?: string;
      };

      if (!res.ok || !data.ok) {
        setLoginError(data.error || "ورود ناموفق بود.");
        return;
      }

      setSession({ authenticated: true, username: data.username || username });
      setPassword("");
    } catch {
      setLoginError("خطا در اتصال به سرور.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout/", { method: "POST" });
    setSession({ authenticated: false });
    setFeedback(null);
  };

  const handleSaveInquiry = async (id: number) => {
    setSavingInquiryId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draftStatuses[id],
          adminNotes: draftNotes[id] ?? "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در ذخیره وضعیت پرونده.",
        });
        return;
      }
      await loadInquiries();
      setFeedback({ type: "success", text: "وضعیت و یادداشت پرونده ذخیره شد." });
    } catch {
      setFeedback({ type: "error", text: "خطا در برقراری ارتباط با سرور." });
    } finally {
      setSavingInquiryId(null);
    }
  };

  const handlePricingFieldChange = (
    systemKey: string,
    field: keyof PricingRuleRow,
    value: string
  ) => {
    const numeric = Number(value);
    setPricingRules((prev) =>
      prev.map((rule) =>
        rule.system_key === systemKey
          ? { ...rule, [field]: Number.isFinite(numeric) ? numeric : 0 }
          : rule
      )
    );
  };

  const handleSavePricingRule = async (rule: PricingRuleRow) => {
    setSavingPricingKey(rule.system_key);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/pricing-rules/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        rule?: PricingRuleRow;
      };
      if (!res.ok || !data.ok || !data.rule) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در بروزرسانی تعرفه.",
        });
        return;
      }
      setPricingRules((prev) =>
        prev.map((r) => (r.system_key === data.rule!.system_key ? data.rule! : r))
      );
      setFeedback({
        type: "success",
        text: `تعرفه «${rule.label}» بروزرسانی شد و بلافاصله در کانفیگوریتور اعمال گردید.`,
      });
    } catch {
      setFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setSavingPricingKey(null);
    }
  };

  const handleCreateWarranty = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setCreatingWarranty(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/warranties/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWarranty),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        warranty?: AdminWarranty;
      };
      if (!res.ok || !data.ok || !data.warranty) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در صدور ضمانت‌نامه.",
        });
        return;
      }
      setNewWarranty({
        customerName: "",
        phone: "",
        city: "",
        systemName: "پنجره دوجداره uPVC سری ۷۰",
        warrantyYears: "15",
        issuedDate: "1405/09/05",
        expiresDate: "1420/09/05",
        serialCode: "",
        notes: "",
      });
      await loadWarranties();
      setFeedback({
        type: "success",
        text: `ضمانت‌نامه جدید با سریال ${data.warranty.serial_code} صادر شد.`,
      });
    } catch {
      setFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setCreatingWarranty(false);
    }
  };

  const handleUpdateServiceStatus = async (id: number, status: string) => {
    setSavingServiceId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/warranty-services/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در تغییر وضعیت خدمات.",
        });
        return;
      }
      await loadWarranties();
      setFeedback({ type: "success", text: "وضعیت درخواست خدمات بروزرسانی شد." });
    } catch {
      setFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setSavingServiceId(null);
    }
  };

  if (!session.authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-dark text-amber-400">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink">
              ورود به پنل مدیریت کارخانه
            </h1>
            <p className="text-xs text-ink-muted">
              گروه صنعتی سپنتا — دسترسی ویژه مدیران فروش و تولید
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-user"
              className="block text-xs font-semibold text-ink"
            >
              نام کاربری
            </label>
            <input
              id="admin-user"
              type="text"
              dir="ltr"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-end text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-pass"
              className="block text-xs font-semibold text-ink"
            >
              رمز عبور
            </label>
            <input
              id="admin-pass"
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-end text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {loginError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {loginLoading ? "در حال بررسی..." : "ورود امن به داشبورد"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            پنل مدیریت و CRM کارخانه سپنتا
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            کاربر فعال:{" "}
            <span dir="ltr" className="font-mono font-bold text-ink">
              {session.username}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              loadInquiries();
              loadPricing();
              loadWarranties();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-subtle px-3.5 py-2 text-xs font-semibold text-ink hover:border-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>بروزرسانی</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl bg-surface-dark px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-surface-elevated"
          >
            <LogOut className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>خروج امن</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold sm:text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="بخش‌های پنل مدیریت"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inquiries"}
          onClick={() => setActiveTab("inquiries")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
            activeTab === "inquiries"
              ? "bg-accent text-white shadow-xs"
              : "border border-border bg-surface text-ink-muted hover:text-ink"
          }`}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          <span>مدیریت استعلام‌ها و فروش (Mini-CRM)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pricing"}
          onClick={() => setActiveTab("pricing")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
            activeTab === "pricing"
              ? "bg-accent text-white shadow-xs"
              : "border border-border bg-surface text-ink-muted hover:text-ink"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>تعرفه و ضرایب قیمت روز</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "warranties"}
          onClick={() => setActiveTab("warranties")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
            activeTab === "warranties"
              ? "bg-accent text-white shadow-xs"
              : "border border-border bg-surface text-ink-muted hover:text-ink"
          }`}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>ضمانت‌نامه‌ها و خدمات پس از فروش</span>
        </button>
      </div>

      {/* TAB 1: Mini-CRM */}
      {activeTab === "inquiries" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs text-ink-muted">کل درخواست‌های ثبت‌شده</p>
              <p className="tabular-nums mt-2 text-2xl font-extrabold text-ink">
                {toPersianDigits(kpis.total)} پرونده
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-accent-soft/50 p-5">
              <p className="text-xs text-accent-hover">درخواست‌های جدید (پاسخ‌داده‌نشده)</p>
              <p className="tabular-nums mt-2 text-2xl font-extrabold text-accent-hover">
                {toPersianDigits(kpis.newCount)} مورد
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs text-ink-muted">مجموع برآورد فروش فعال</p>
              <p className="tabular-nums mt-2 text-xl font-extrabold text-ink sm:text-2xl">
                {formatToman(kpis.pipelineIrr)}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو با کد رهگیری، نام، شماره تماس یا شهر..."
                className="w-full rounded-xl border border-border bg-surface-subtle py-2.5 ps-10 pe-3.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                loadInquiries(e.target.value, searchQuery);
              }}
              aria-label="فیلتر وضعیت"
              className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(INQUIRY_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => loadInquiries(statusFilter, searchQuery)}
              className="rounded-xl bg-surface-dark px-4 py-2.5 text-xs font-semibold text-ink-inverse hover:bg-surface-elevated"
            >
              اعمال فیلتر
            </button>
          </div>

          {/* Inquiry List */}
          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-ink-muted">
                درخواستی مطابق فیلتر فعلی یافت نشد.
              </div>
            ) : (
              inquiries.map((inq) => {
                const isExpanded = expandedId === inq.id;
                return (
                  <div
                    key={inq.id}
                    className="overflow-hidden rounded-2xl border border-border bg-surface"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                      aria-expanded={isExpanded}
                      className="flex w-full flex-wrap items-center justify-between gap-4 p-4 text-start transition-colors hover:bg-surface-subtle sm:p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          dir="ltr"
                          className="rounded-lg bg-surface-dark px-2.5 py-1 font-mono text-xs font-bold text-amber-400"
                        >
                          {inq.trackingCode}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-ink">
                            {inq.customerName} — {inq.city}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {inq.projectType} •{" "}
                            <span dir="ltr" className="tabular-nums font-medium">
                              {inq.phone}
                            </span>{" "}
                            • {formatFaDate(inq.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {inq.estimatedTotalIrr > 0 && (
                          <span className="tabular-nums text-xs font-bold text-accent-hover sm:text-sm">
                            {formatToman(inq.estimatedTotalIrr)}
                          </span>
                        )}
                        <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent-hover">
                          {INQUIRY_STATUS_LABELS[inq.status] ?? inq.status}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-ink-muted transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 border-t border-border bg-surface-subtle p-4 sm:p-6">
                        {inq.notes && (
                          <div className="rounded-xl border border-border bg-surface p-3.5 text-xs leading-6 text-ink">
                            <strong>توضیحات مشتری:</strong> {inq.notes}
                          </div>
                        )}

                        {inq.attachmentPath && (
                          <div>
                            <a
                              href={`/api/admin/uploads/${inq.attachmentPath}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-accent-soft px-4 py-2 text-xs font-bold text-accent-hover hover:bg-amber-200/70"
                            >
                              <Download className="h-4 w-4" aria-hidden="true" />
                              <span>
                                دانلود فایل پیوست:{" "}
                                {inq.attachmentOriginalName || inq.attachmentPath}
                              </span>
                            </a>
                          </div>
                        )}

                        {inq.items.length > 0 && (
                          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
                            {inq.items.map((item, idx) => (
                              <div
                                key={`${inq.id}-item-${idx}`}
                                className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs"
                              >
                                <span className="font-semibold text-ink">
                                  {toPersianDigits(idx + 1)}.{" "}
                                  {item.locationName || "دهانه"} —{" "}
                                  {SYSTEM_RULES[item.system]?.shortLabel ??
                                    item.system}{" "}
                                  ({toPersianDigits(item.widthCm)}×
                                  {toPersianDigits(item.heightCm)} سم •{" "}
                                  {toPersianDigits(item.quantity)} عدد •{" "}
                                  {GLASS_OPTIONS[item.glassType]?.shortLabel ??
                                    item.glassType}{" "}
                                  •{" "}
                                  {FRAME_FINISHES[item.finish]?.label ??
                                    item.finish}
                                  )
                                </span>
                                {item.breakdown?.totalIrr ? (
                                  <span className="tabular-nums font-bold text-accent-hover">
                                    {formatToman(item.breakdown.totalIrr)}
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                          <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-ink">
                              تغییر وضعیت پرونده
                            </label>
                            <select
                              value={draftStatuses[inq.id] ?? inq.status}
                              onChange={(e) =>
                                setDraftStatuses((prev) => ({
                                  ...prev,
                                  [inq.id]: e.target.value,
                                }))
                              }
                              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                            >
                              {Object.entries(INQUIRY_STATUS_LABELS).map(
                                ([key, label]) => (
                                  <option key={key} value={key}>
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="md:col-span-6">
                            <label className="block text-xs font-semibold text-ink">
                              یادداشت داخلی کارشناس (فقط ادمین)
                            </label>
                            <input
                              type="text"
                              value={draftNotes[inq.id] ?? ""}
                              onChange={(e) =>
                                setDraftNotes((prev) => ({
                                  ...prev,
                                  [inq.id]: e.target.value,
                                }))
                              }
                              placeholder="مثلاً: تاریخ بازدید هماهنگ شد..."
                              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                            />
                          </div>

                          <div className="flex items-end md:col-span-2">
                            <button
                              type="button"
                              disabled={savingInquiryId === inq.id}
                              onClick={() => handleSaveInquiry(inq.id)}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                            >
                              <Save className="h-4 w-4" aria-hidden="true" />
                              <span>
                                {savingInquiryId === inq.id ? "ذخیره..." : "ذخیره"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Live Pricing Editor */}
      {activeTab === "pricing" && (
        <div className="space-y-4">
          <p className="text-xs leading-6 text-ink-muted sm:text-sm">
            تمامی مبالغ تعرفه بر حسب <strong>ریال</strong> هستند. ذخیره هر ردیف،
            محاسبه قیمت آنلاین در <span dir="ltr">/configurator/</span> و محاسبات
            سمت سرور را بلافاصله بروزرسانی می‌کند.
          </p>

          <div className="space-y-4">
            {pricingRules.map((rule) => (
              <div
                key={rule.system_key}
                className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-base font-bold text-ink">{rule.label}</h2>
                    <p dir="ltr" className="font-mono text-xs text-ink-muted">
                      {rule.system_key}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={savingPricingKey === rule.system_key}
                    onClick={() => handleSavePricingRule(rule)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {savingPricingKey === rule.system_key
                        ? "در حال ذخیره..."
                        : "ذخیره تعرفه"}
                    </span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      تعرفه پایه مترمربع (ریال)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={rule.base_price_per_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "base_price_per_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      حداقل متراژ محاسبه (م²)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      dir="ltr"
                      value={rule.min_billable_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "min_billable_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      شیشه دوجداره استاندارد (ریال)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={rule.glass_standard_per_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "glass_standard_per_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      شیشه لمینت صوتی (ریال)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={rule.glass_acoustic_per_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "glass_acoustic_per_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      شیشه سه‌جداره حرارتی (ریال)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={rule.glass_triple_per_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "glass_triple_per_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      شیشه سکوریت ۸ میل (ریال)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={rule.glass_tempered_per_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "glass_tempered_per_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      توری پلیسه همرنگ (ریال/م²)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={rule.pleated_mesh_per_sqm}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "pleated_mesh_per_sqm",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      ضریب رنگ/لمینت (درصد)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      dir="ltr"
                      value={rule.color_surcharge_percent}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "color_surcharge_percent",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-muted">
                      هزینه نصب و رگلاژ (درصد)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      dir="ltr"
                      value={rule.installation_percent}
                      onChange={(e) =>
                        handlePricingFieldChange(
                          rule.system_key,
                          "installation_percent",
                          e.target.value
                        )
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-end text-sm font-bold text-ink"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Warranties & Service Requests */}
      {activeTab === "warranties" && (
        <div className="space-y-8">
          {/* Issue New Warranty */}
          <form
            onSubmit={handleCreateWarranty}
            className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-base font-bold text-ink">
                صدور ضمانت‌نامه جدید کارخانه
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                required
                placeholder="نام کارفرما / پروژه *"
                value={newWarranty.customerName}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, customerName: e.target.value })
                }
                className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink"
              />
              <input
                type="tel"
                dir="ltr"
                required
                placeholder="09120000000 *"
                value={newWarranty.phone}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, phone: e.target.value })
                }
                className="tabular-nums rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-end text-sm text-ink"
              />
              <input
                type="text"
                required
                placeholder="شهر *"
                value={newWarranty.city}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, city: e.target.value })
                }
                className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink"
              />
              <input
                type="text"
                required
                placeholder="سیستم اجراشده *"
                value={newWarranty.systemName}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, systemName: e.target.value })
                }
                className="rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink"
              />
              <input
                type="number"
                dir="ltr"
                required
                min={1}
                max={30}
                placeholder="مدت (سال)"
                value={newWarranty.warrantyYears}
                onChange={(e) =>
                  setNewWarranty({
                    ...newWarranty,
                    warrantyYears: e.target.value,
                  })
                }
                className="tabular-nums rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-end text-sm text-ink"
              />
              <input
                type="text"
                dir="ltr"
                required
                placeholder="تاریخ صدور (1405/09/05)"
                value={newWarranty.issuedDate}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, issuedDate: e.target.value })
                }
                className="tabular-nums rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-end text-sm text-ink"
              />
              <input
                type="text"
                dir="ltr"
                required
                placeholder="تاریخ انقضا (1420/09/05)"
                value={newWarranty.expiresDate}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, expiresDate: e.target.value })
                }
                className="tabular-nums rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-end text-sm text-ink"
              />
              <input
                type="text"
                dir="ltr"
                placeholder="سریال دلخواه (اختیاری)"
                value={newWarranty.serialCode}
                onChange={(e) =>
                  setNewWarranty({ ...newWarranty, serialCode: e.target.value })
                }
                className="font-mono rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-end text-sm text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={creatingWarranty}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>
                {creatingWarranty ? "در حال صدور..." : "صدور و ثبت ضمانت‌نامه"}
              </span>
            </button>
          </form>

          {/* Warranties Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border bg-surface-subtle px-5 py-3.5">
              <h2 className="text-sm font-bold text-ink">
                فهرست ضمانت‌نامه‌های صادرشده ({toPersianDigits(warranties.length)})
              </h2>
            </div>

            <div className="divide-y divide-border">
              {warranties.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs sm:px-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        dir="ltr"
                        className="rounded-md bg-surface-dark px-2.5 py-1 font-mono font-bold text-amber-400"
                      >
                        {w.serial_code}
                      </span>
                      <span className="font-bold text-ink">
                        {w.customer_name}
                      </span>
                      <span className="text-ink-muted">({w.city})</span>
                    </div>
                    <p className="mt-1 text-ink-muted">
                      {w.system_name} •{" "}
                      <span dir="ltr" className="tabular-nums">
                        {w.phone}
                      </span>{" "}
                      • اعتبار تا {toPersianDigits(w.expires_date)}
                    </p>
                  </div>

                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
                    {WARRANTY_STATUS_LABELS[w.status] ?? w.status} (
                    {toPersianDigits(w.warranty_years)} سال)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Requests Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border bg-surface-subtle px-5 py-3.5">
              <h2 className="text-sm font-bold text-ink">
                درخواست‌های خدمات و رگلاژ مشتریان (
                {toPersianDigits(serviceRequests.length)})
              </h2>
            </div>

            {serviceRequests.length === 0 ? (
              <p className="p-6 text-xs text-ink-muted">
                درخواست خدمات جدیدی ثبت نشده است.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {serviceRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col justify-between gap-3 p-4 text-xs sm:flex-row sm:items-center sm:px-5"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          dir="ltr"
                          className="font-mono font-bold text-accent-hover"
                        >
                          {req.tracking_code}
                        </span>
                        <span className="font-bold text-ink">
                          {req.customer_name} ({req.city})
                        </span>
                        <span dir="ltr" className="font-mono text-ink-muted">
                          [{req.serial_code}]
                        </span>
                      </div>
                      <p className="font-semibold text-ink">
                        {SERVICE_REQUEST_TYPE_LABELS[req.request_type] ??
                          req.request_type}
                      </p>
                      <p className="text-ink-muted">{req.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={req.status}
                        disabled={savingServiceId === req.id}
                        onChange={(e) =>
                          handleUpdateServiceStatus(req.id, e.target.value)
                        }
                        aria-label={`وضعیت درخواست ${req.tracking_code}`}
                        className="rounded-xl border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-ink"
                      >
                        <option value="open">باز (در انتظار بررسی)</option>
                        <option value="in_progress">در حال پیگیری</option>
                        <option value="resolved">انجام شده</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Download,
  History,
  ListChecks,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import type { AdminUserProfile } from "@/lib/admin-auth";
import {
  ROLE_LABELS,
  type PermissionKey,
} from "@/lib/permissions";
import {
  StaffManagementPanel,
  type StaffMemberItem,
} from "./StaffManagementPanel";
import {
  TasksChecklistPanel,
  type StaffTaskItem,
} from "./TasksChecklistPanel";
import {
  FRAME_FINISHES,
  GLASS_OPTIONS,
  isValidSystemKey,
  SYSTEM_RULES,
  type ConfiguratorSystemKey,
  type FrameFinishKey,
  type GlassOptionKey,
} from "@/lib/configurator-rules";
import {
  formatFxTimestamp,
  getFxSourceLabel,
  getPricingUnitLabel,
} from "@/lib/fx-labels";
import { toPersianDigits } from "@/lib/persian-seo";
import {
  evaluateItemFormula,
  formatIrr,
  formatToman,
  type FxMode,
  type FxRateHistoryRow,
  type FxSettingsRow,
  type PricingRuleRow,
} from "@/lib/pricing-calculator";
import {
  INQUIRY_STATUS_LABELS,
  SERVICE_REQUEST_TYPE_LABELS,
  WARRANTY_STATUS_LABELS,
} from "@/lib/tracking";

interface SessionState {
  authenticated: boolean;
  user?: AdminUserProfile;
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

type AdminTab = "tasks" | "inquiries" | "pricing" | "warranties" | "staff";

function resolveDefaultTab(user?: AdminUserProfile): AdminTab {
  if (!user) return "tasks";
  if (user.role === "staff") return "tasks";
  if (user.permissions.includes("inquiries:view")) return "inquiries";
  if (user.permissions.includes("pricing:view")) return "pricing";
  if (user.permissions.includes("warranties:manage")) return "warranties";
  if (user.permissions.includes("staff:manage")) return "staff";
  return "tasks";
}

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
  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    resolveDefaultTab(initialSession.user)
  );

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

  // Pricing rules & FX state
  const [pricingRules, setPricingRules] = useState<PricingRuleRow[]>([]);
  const [savingPricingKey, setSavingPricingKey] = useState<string | null>(null);
  const [fxSettings, setFxSettings] = useState<FxSettingsRow | null>(null);
  const [fxHistory, setFxHistory] = useState<FxRateHistoryRow[]>([]);
  const [fxModeDraft, setFxModeDraft] = useState<FxMode>("auto");
  const [manualUsdDraft, setManualUsdDraft] = useState<string>("700000");
  const [syncIntervalDraft, setSyncIntervalDraft] = useState<string>("10");
  const [savingFx, setSavingFx] = useState(false);
  const [syncingFx, setSyncingFx] = useState(false);

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

  // Staff & tasks state
  const [staffList, setStaffList] = useState<StaffMemberItem[]>([]);
  const [tasksList, setTasksList] = useState<StaffTaskItem[]>([]);
  const [selectedTaskStaffFilter, setSelectedTaskStaffFilter] = useState("all");
  const [defaultAssignStaffId, setDefaultAssignStaffId] = useState<number | null>(
    null
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasPerm = useCallback(
    (perm: PermissionKey) =>
      Boolean(session.user?.permissions.includes(perm)),
    [session.user]
  );

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
      fx?: FxSettingsRow;
      rules?: PricingRuleRow[];
    };
    if (data.ok && data.rules) {
      setPricingRules(data.rules);
    }
    if (data.ok && data.fx) {
      setFxSettings(data.fx);
      setFxModeDraft(data.fx.mode);
      setManualUsdDraft(String(data.fx.manual_usd_irr));
      setSyncIntervalDraft(String(data.fx.sync_interval_minutes));
    }
  }, []);

  const loadFx = useCallback(async () => {
    const res = await fetch("/api/admin/fx/", { cache: "no-store" });
    if (res.status === 401) {
      setSession({ authenticated: false });
      return;
    }
    const data = (await res.json()) as {
      ok?: boolean;
      fx?: FxSettingsRow;
      history?: FxRateHistoryRow[];
    };
    if (data.ok && data.fx) {
      setFxSettings(data.fx);
      setFxModeDraft(data.fx.mode);
      setManualUsdDraft(String(data.fx.manual_usd_irr));
      setSyncIntervalDraft(String(data.fx.sync_interval_minutes));
    }
    if (data.ok && data.history) {
      setFxHistory(data.history);
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

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/admin/staff/", { cache: "no-store" });
    if (res.status === 401) {
      setSession({ authenticated: false });
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      ok?: boolean;
      staff?: StaffMemberItem[];
    };
    if (data.ok && data.staff) {
      setStaffList(data.staff);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    const res = await fetch("/api/admin/tasks/", { cache: "no-store" });
    if (res.status === 401) {
      setSession({ authenticated: false });
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      ok?: boolean;
      tasks?: StaffTaskItem[];
    };
    if (data.ok && data.tasks) {
      setTasksList(data.tasks);
    }
  }, []);

  useEffect(() => {
    if (!session.authenticated || !session.user) return;
    let active = true;
    const perms = new Set(session.user.permissions);

    const requests: Promise<void>[] = [
      fetch("/api/admin/tasks/", { cache: "no-store" }).then(async (res) => {
        if (!active) return;
        if (res.status === 401) {
          setSession({ authenticated: false });
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          tasks?: StaffTaskItem[];
        };
        if (active && data.ok && data.tasks) {
          setTasksList(data.tasks);
        }
      }),
    ];

    if (perms.has("inquiries:view")) {
      requests.push(
        fetch("/api/admin/inquiries/", { cache: "no-store" }).then(
          async (res) => {
            if (!active) return;
            if (res.status === 401) {
              setSession({ authenticated: false });
              return;
            }
            if (!res.ok) return;
            const inqData = (await res.json()) as {
              ok?: boolean;
              kpis?: { total: number; newCount: number; pipelineIrr: number };
              inquiries?: AdminInquiry[];
            };
            if (active && inqData.ok && inqData.inquiries) {
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
          }
        )
      );
    }

    if (perms.has("pricing:view")) {
      requests.push(
        fetch("/api/admin/pricing-rules/", { cache: "no-store" }).then(
          async (res) => {
            if (!active) return;
            if (res.status === 401) {
              setSession({ authenticated: false });
              return;
            }
            if (!res.ok) return;
            const priceData = (await res.json()) as {
              ok?: boolean;
              rules?: PricingRuleRow[];
            };
            if (active && priceData.ok && priceData.rules) {
              setPricingRules(priceData.rules);
            }
          }
        ),
        fetch("/api/admin/fx/", { cache: "no-store" }).then(async (res) => {
          if (!active) return;
          if (res.status === 401) {
            setSession({ authenticated: false });
            return;
          }
          if (!res.ok) return;
          const fxData = (await res.json()) as {
            ok?: boolean;
            fx?: FxSettingsRow;
            history?: FxRateHistoryRow[];
          };
          if (active && fxData.ok && fxData.fx) {
            setFxSettings(fxData.fx);
            setFxModeDraft(fxData.fx.mode);
            setManualUsdDraft(String(fxData.fx.manual_usd_irr));
            setSyncIntervalDraft(String(fxData.fx.sync_interval_minutes));
          }
          if (active && fxData.ok && fxData.history) {
            setFxHistory(fxData.history);
          }
        })
      );
    }

    if (perms.has("warranties:manage")) {
      requests.push(
        fetch("/api/admin/warranties/", { cache: "no-store" }).then(
          async (res) => {
            if (!active) return;
            if (res.status === 401) {
              setSession({ authenticated: false });
              return;
            }
            if (!res.ok) return;
            const warData = (await res.json()) as {
              ok?: boolean;
              warranties?: AdminWarranty[];
              serviceRequests?: AdminServiceRequest[];
            };
            if (active && warData.ok) {
              setWarranties(warData.warranties ?? []);
              setServiceRequests(warData.serviceRequests ?? []);
            }
          }
        )
      );
    }

    if (perms.has("staff:manage")) {
      requests.push(
        fetch("/api/admin/staff/", { cache: "no-store" }).then(async (res) => {
          if (!active) return;
          if (res.status === 401) {
            setSession({ authenticated: false });
            return;
          }
          if (!res.ok) return;
          const staffData = (await res.json()) as {
            ok?: boolean;
            staff?: StaffMemberItem[];
          };
          if (active && staffData.ok && staffData.staff) {
            setStaffList(staffData.staff);
          }
        })
      );
    }

    Promise.all(requests).catch(() => {
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
  }, [session.authenticated, session.user]);

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
        user?: AdminUserProfile;
      };

      if (!res.ok || !data.ok || !data.user) {
        setLoginError(data.error || "ورود ناموفق بود.");
        return;
      }

      setSession({ authenticated: true, user: data.user });
      setActiveTab(resolveDefaultTab(data.user));
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
        rules?: PricingRuleRow[];
      };
      if (!res.ok || !data.ok || !data.rule) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در بروزرسانی تعرفه و فرمول.",
        });
        return;
      }
      if (Array.isArray(data.rules)) {
        setPricingRules(data.rules);
      } else {
        setPricingRules((prev) =>
          prev.map((r) => (r.system_key === data.rule!.system_key ? data.rule! : r))
        );
      }
      setFeedback({
        type: "success",
        text: `فرمول و تعرفه «${rule.label}» ذخیره شد (${formatToman(data.rule.computed_price_per_sqm)}).`,
      });
    } catch {
      setFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setSavingPricingKey(null);
    }
  };

  const handleSaveFxSettings = async () => {
    setSavingFx(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/fx/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: fxModeDraft,
          manualUsdIrr: manualUsdDraft,
          syncIntervalMinutes: syncIntervalDraft,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fx?: FxSettingsRow;
        history?: FxRateHistoryRow[];
        rules?: PricingRuleRow[];
      };
      if (!res.ok || !data.ok || !data.fx) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در ذخیره تنظیمات نرخ ارز.",
        });
        return;
      }
      setFxSettings(data.fx);
      setFxModeDraft(data.fx.mode);
      setManualUsdDraft(String(data.fx.manual_usd_irr));
      setSyncIntervalDraft(String(data.fx.sync_interval_minutes));
      if (data.history) setFxHistory(data.history);
      if (data.rules) setPricingRules(data.rules);

      setFeedback({
        type: "success",
        text: `تنظیمات ارز ذخیره شد (نرخ فعال: ${formatToman(data.fx.active_usd_irr)}) و قیمت تمامی محصولات بازمحاسبه گردید.`,
      });
    } catch {
      setFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setSavingFx(false);
    }
  };

  const handleSyncFxNow = async () => {
    setSyncingFx(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/fx/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_now" }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fx?: FxSettingsRow;
        history?: FxRateHistoryRow[];
        rules?: PricingRuleRow[];
      };
      if (!res.ok || !data.ok || !data.fx) {
        setFeedback({
          type: "error",
          text: data.error || "خطا در همگام‌سازی لحظه‌ای نرخ دلار.",
        });
        return;
      }
      setFxSettings(data.fx);
      setFxModeDraft(data.fx.mode);
      if (data.history) setFxHistory(data.history);
      if (data.rules) setPricingRules(data.rules);

      if (data.fx.mode === "manual") {
        setFeedback({
          type: "success",
          text: `حالت فعلی روی «نرخ دستی مدیر» است؛ قیمت محصولات با نرخ دستی (${formatToman(data.fx.active_usd_irr)}) بروزرسانی شد.`,
        });
      } else if (data.fx.source_used === "cached" && data.fx.last_error) {
        setFeedback({
          type: "error",
          text: `سرویس‌های نرخ ارز در دسترس نبودند؛ نرخ کش ذخیره‌شده (${formatToman(data.fx.active_usd_irr)}) حفظ شد.`,
        });
      } else {
        setFeedback({
          type: "success",
          text: `نرخ دلار لحظه‌ای از «${getFxSourceLabel(data.fx.source_used)}» دریافت شد (${formatToman(data.fx.active_usd_irr)}) و قیمت محصولات بروزرسانی گردید.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setSyncingFx(false);
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

  const currentUser = session.user;
  const canViewInquiries = hasPerm("inquiries:view");
  const canEditInquiries = hasPerm("inquiries:edit");
  const canDownloadUploads = hasPerm("uploads:download");
  const canViewPricing = hasPerm("pricing:view");
  const canEditPricing = hasPerm("pricing:edit");
  const canManageWarranties = hasPerm("warranties:manage");
  const canManageStaff = hasPerm("staff:manage");

  const handleRefreshAll = () => {
    loadTasks();
    if (canViewInquiries) loadInquiries();
    if (canViewPricing) {
      loadPricing();
      loadFx();
    }
    if (canManageWarranties) loadWarranties();
    if (canManageStaff) loadStaff();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            پنل مدیریت و CRM کارخانه سپنتا
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="font-bold text-ink">
              {currentUser?.fullName || currentUser?.username}
            </span>
            {currentUser?.jobTitle && (
              <span>• {currentUser.jobTitle}</span>
            )}
            <span dir="ltr" className="font-mono text-ink-muted">
              (@{currentUser?.username})
            </span>
            <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-hover">
              {currentUser?.userId === "root"
                ? "مدیر ارشد"
                : currentUser
                  ? ROLE_LABELS[currentUser.role]
                  : "کاربر"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshAll}
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

      {/* Permission-Aware Navigation Tabs */}
      <div
        role="tablist"
        aria-label="بخش‌های پنل مدیریت"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tasks"}
          onClick={() => setActiveTab("tasks")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
            activeTab === "tasks"
              ? "bg-accent text-white shadow-xs"
              : "border border-border bg-surface text-ink-muted hover:text-ink"
          }`}
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          <span>
            {canManageStaff ? "وظایف و چک‌لیست تیم" : "شرح وظایف من"}
          </span>
        </button>

        {canViewInquiries && (
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
        )}

        {canViewPricing && (
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
            <span>نرخ دلار و فرمول قیمت محصولات</span>
          </button>
        )}

        {canManageWarranties && (
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
        )}

        {canManageStaff && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "staff"}
            onClick={() => setActiveTab("staff")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
              activeTab === "staff"
                ? "bg-accent text-white shadow-xs"
                : "border border-border bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            <UserCog className="h-4 w-4" aria-hidden="true" />
            <span>کارکنان و دسترسی‌ها</span>
          </button>
        )}
      </div>

      {/* TAB: Tasks Checklist */}
      {activeTab === "tasks" && (
        <TasksChecklistPanel
          tasks={tasksList}
          staffList={staffList}
          canManageStaff={canManageStaff}
          selectedStaffFilter={selectedTaskStaffFilter}
          onSelectedStaffFilterChange={setSelectedTaskStaffFilter}
          defaultAssignStaffId={defaultAssignStaffId}
          onRefreshTasks={async () => {
            await loadTasks();
            if (canManageStaff) await loadStaff();
          }}
          onFeedback={setFeedback}
        />
      )}

      {/* TAB: Staff Management */}
      {activeTab === "staff" && canManageStaff && (
        <StaffManagementPanel
          staffList={staffList}
          currentUserId={currentUser?.userId ?? "root"}
          onRefreshStaff={async () => {
            await loadStaff();
            await loadTasks();
          }}
          onJumpToTasksForStaff={(staffId) => {
            setDefaultAssignStaffId(staffId);
            setSelectedTaskStaffFilter(String(staffId));
            setActiveTab("tasks");
          }}
          onFeedback={setFeedback}
        />
      )}

      {/* TAB 1: Mini-CRM */}
      {activeTab === "inquiries" && canViewInquiries && (
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

                        {inq.attachmentPath && canDownloadUploads && (
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

                        {canEditInquiries ? (
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
                        ) : (
                          inq.adminNotes && (
                            <div className="rounded-xl border border-border bg-surface p-3.5 text-xs text-ink-muted">
                              <strong>یادداشت کارشناس:</strong> {inq.adminNotes}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Live FX & Formula Pricing Editor */}
      {activeTab === "pricing" && canViewPricing && (
        <div className="space-y-6">
          {!canEditPricing && (
            <div className="rounded-xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-ink-muted">
              دسترسی شما به این بخش فقط‌خواندنی است؛ برای ویرایش نرخ دلار یا
              فرمول کالاها مجوز «ویرایش تعرفه و فرمول کالاها» لازم است.
            </div>
          )}
          {/* FX Control Panel */}
          <section className="rounded-2xl border border-amber-200 bg-surface p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign
                    className="h-5 w-5 text-accent"
                    aria-hidden="true"
                  />
                  <h2 className="text-base font-extrabold text-ink sm:text-lg">
                    مدیریت نرخ لحظه‌ای دلار و همگام‌سازی سرور
                  </h2>
                </div>
                <p className="mt-1 text-xs leading-6 text-ink-muted">
                  با تغییر نرخ دلار (خودکار یا دستی)، قیمت پایه تمامی محصولات در{" "}
                  <span dir="ltr">/products/</span> و محاسبه‌گر{" "}
                  <span dir="ltr">/configurator/</span> به‌صورت اتمیک و فوری
                  بازمحاسبه می‌شوند.
                </p>
              </div>

              {canEditPricing && (
                <button
                  type="button"
                  disabled={syncingFx}
                  onClick={handleSyncFxNow}
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-dark px-4 py-2.5 text-xs font-semibold text-ink-inverse transition-colors hover:bg-surface-elevated disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 text-amber-400 ${
                      syncingFx ? "animate-spin" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    {syncingFx
                      ? "در حال دریافت نرخ..."
                      : "بروزرسانی لحظه‌ای نرخ دلار"}
                  </span>
                </button>
              )}
            </div>

            {fxSettings && (
              <div className="mt-5 space-y-5">
                {/* Active Rate Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-amber-200 bg-accent-soft/60 p-4">
                    <p className="text-xs font-semibold text-accent-hover">
                      نرخ فعال مبنای محاسبه
                    </p>
                    <p className="tabular-nums mt-1.5 text-xl font-extrabold text-ink">
                      {formatToman(fxSettings.active_usd_irr)}
                    </p>
                    <p className="tabular-nums mt-0.5 text-[11px] text-ink-muted">
                      معادل {formatIrr(fxSettings.active_usd_irr)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-subtle p-4">
                    <p className="text-xs font-semibold text-ink-muted">
                      منبع و وضعیت فعلی
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-surface-dark px-2.5 py-1 text-xs font-bold text-amber-400">
                        {getFxSourceLabel(fxSettings.source_used)}
                      </span>
                      <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-ink">
                        {fxSettings.mode === "auto"
                          ? "حالت خودکار"
                          : "حالت دستی"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-subtle p-4">
                    <p className="text-xs font-semibold text-ink-muted">
                      آخرین همگام‌سازی موفق
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-ink">
                      {formatFxTimestamp(fxSettings.last_synced_at)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      کش خودکار هر{" "}
                      {toPersianDigits(fxSettings.sync_interval_minutes)} دقیقه
                    </p>
                  </div>
                </div>

                {fxSettings.last_error && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>گزارش آخرین تلاش همگام‌سازی:</strong>{" "}
                      <span dir="ltr" className="font-mono">
                        {fxSettings.last_error}
                      </span>
                    </span>
                  </div>
                )}

                {/* Mode & Manual Override Form */}
                {canEditPricing && (
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface-subtle p-4 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <p className="text-xs font-semibold text-ink">
                      حالت دریافت نرخ دلار
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFxModeDraft("auto")}
                        aria-pressed={fxModeDraft === "auto"}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          fxModeDraft === "auto"
                            ? "bg-accent text-white shadow-xs"
                            : "border border-border bg-surface text-ink-muted hover:text-ink"
                        }`}
                      >
                        خودکار از سرور
                      </button>
                      <button
                        type="button"
                        onClick={() => setFxModeDraft("manual")}
                        aria-pressed={fxModeDraft === "manual"}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          fxModeDraft === "manual"
                            ? "bg-accent text-white shadow-xs"
                            : "border border-border bg-surface text-ink-muted hover:text-ink"
                        }`}
                      >
                        نرخ دستی مدیر
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label
                      htmlFor="fx-manual-usd"
                      className="block text-xs font-semibold text-ink"
                    >
                      نرخ دلار دستی (ریال)
                    </label>
                    <input
                      id="fx-manual-usd"
                      type="number"
                      min={100000}
                      step={10000}
                      dir="ltr"
                      value={manualUsdDraft}
                      onChange={(e) => setManualUsdDraft(e.target.value)}
                      className="tabular-nums mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink focus:border-accent focus:outline-none"
                    />
                    <p className="tabular-nums mt-1 text-[11px] text-ink-muted">
                      معادل:{" "}
                      {Number.isFinite(Number(manualUsdDraft)) &&
                      Number(manualUsdDraft) > 0
                        ? formatToman(Number(manualUsdDraft))
                        : "—"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="fx-sync-interval"
                      className="block text-xs font-semibold text-ink"
                    >
                      بازه کش (دقیقه)
                    </label>
                    <input
                      id="fx-sync-interval"
                      type="number"
                      min={1}
                      max={1440}
                      dir="ltr"
                      value={syncIntervalDraft}
                      onChange={(e) => setSyncIntervalDraft(e.target.value)}
                      className="tabular-nums mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end md:col-span-3">
                    <button
                      type="button"
                      disabled={savingFx}
                      onClick={handleSaveFxSettings}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {savingFx
                          ? "در حال ذخیره..."
                          : "ذخیره تنظیمات ارز و بازمحاسبه"}
                      </span>
                    </button>
                  </div>
                </div>
                )}

                {/* Recent FX Rate History */}
                {fxHistory.length > 0 && (
                  <div className="rounded-xl border border-border bg-surface-subtle p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink">
                      <History
                        className="h-4 w-4 text-accent"
                        aria-hidden="true"
                      />
                      <span>
                        تاریخچه تغییرات نرخ دلار (
                        {toPersianDigits(fxHistory.length)} مورد اخیر)
                      </span>
                    </div>
                    <div className="mt-3 max-h-44 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface text-xs">
                      {fxHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-surface-subtle px-2 py-0.5 font-semibold text-ink">
                              {getFxSourceLabel(item.source)}
                            </span>
                            <span className="text-ink-muted">
                              {formatFxTimestamp(item.recorded_at)}
                            </span>
                          </div>
                          <span className="tabular-nums font-bold text-ink">
                            {formatToman(item.usd_irr)} (
                            {formatIrr(item.usd_irr)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <p className="text-xs leading-6 text-ink-muted sm:text-sm">
            فرمول قیمت‌گذاری هر کالا بر اساس{" "}
            <span dir="ltr" className="font-mono font-semibold text-ink">
              (نرخ دلار × ضریب ارزی × ضریب فرمول) + هزینه ثابت
            </span>{" "}
            محاسبه و بر اساس گام رندسازی به ریال گرد می‌شود. تمامی مبالغ ورودی
            فرمول بر حسب <strong>ریال</strong> هستند.
          </p>

          <div className="space-y-4">
            {pricingRules.map((rule) => {
              const activeUsdIrr =
                fxSettings?.mode === "manual"
                  ? fxSettings.manual_usd_irr
                  : (fxSettings?.active_usd_irr ?? 700000);
              const previewIrr = evaluateItemFormula({
                usdIrr: activeUsdIrr,
                usdUnitsPerSqm: rule.usd_units_per_sqm,
                formulaMultiplier: rule.formula_multiplier,
                fixedSurchargeIrr: rule.fixed_surcharge_irr,
                roundingStepIrr: rule.rounding_step_irr,
                fallbackBasePricePerSqm: rule.base_price_per_sqm,
              });
              const unitLabel = getPricingUnitLabel(rule.system_key);
              const isConfiguratorSys = isValidSystemKey(rule.system_key);

              return (
                <div
                  key={rule.system_key}
                  className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-ink">
                          {rule.label}
                        </h2>
                        <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                          {unitLabel}
                        </span>
                      </div>
                      <p dir="ltr" className="font-mono text-xs text-ink-muted">
                        {rule.system_key}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-xl border border-amber-200 bg-accent-soft/60 px-3.5 py-2 text-end text-xs">
                        <p className="text-[11px] text-accent-hover">
                          پیش‌نمایش قیمت فرمول ({unitLabel})
                        </p>
                        <p className="tabular-nums font-extrabold text-ink">
                          {formatToman(previewIrr)}
                        </p>
                      </div>

                      {canEditPricing && (
                        <button
                          type="button"
                          disabled={savingPricingKey === rule.system_key}
                          onClick={() => handleSavePricingRule(rule)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                        >
                          <Save className="h-4 w-4" aria-hidden="true" />
                          <span>
                            {savingPricingKey === rule.system_key
                              ? "در حال ذخیره..."
                              : "ذخیره فرمول و تعرفه"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formula Parameters */}
                  <div className="mt-4 rounded-xl border border-border bg-surface-subtle/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-ink">
                        پارامترهای فرمول متصل به دلار
                      </span>
                      <span className="tabular-nums text-[11px] text-ink-muted">
                        مقدار ذخیره‌شده فعلی:{" "}
                        <strong className="text-ink">
                          {formatToman(rule.computed_price_per_sqm)}
                        </strong>
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          ضریب ارزی (واحد دلار)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          dir="ltr"
                          value={rule.usd_units_per_sqm}
                          onChange={(e) =>
                            handlePricingFieldChange(
                              rule.system_key,
                              "usd_units_per_sqm",
                              e.target.value
                            )
                          }
                          className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          ضریب فرمول مدیر
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min={0}
                          dir="ltr"
                          value={rule.formula_multiplier}
                          onChange={(e) =>
                            handlePricingFieldChange(
                              rule.system_key,
                              "formula_multiplier",
                              e.target.value
                            )
                          }
                          className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          هزینه ثابت ساخت/یراق (ریال)
                        </label>
                        <input
                          type="number"
                          step={10000}
                          dir="ltr"
                          value={rule.fixed_surcharge_irr}
                          onChange={(e) =>
                            handlePricingFieldChange(
                              rule.system_key,
                              "fixed_surcharge_irr",
                              e.target.value
                            )
                          }
                          className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          گام رند کردن قیمت (ریال)
                        </label>
                        <input
                          type="number"
                          min={1000}
                          step={1000}
                          dir="ltr"
                          value={rule.rounding_step_irr}
                          onChange={(e) =>
                            handlePricingFieldChange(
                              rule.system_key,
                              "rounding_step_irr",
                              e.target.value
                            )
                          }
                          className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-muted">
                          تعرفه پایه جایگزین (ریال)
                        </label>
                        <input
                          type="number"
                          min={0}
                          dir="ltr"
                          value={rule.base_price_per_sqm}
                          onChange={(e) =>
                            handlePricingFieldChange(
                              rule.system_key,
                              "base_price_per_sqm",
                              e.target.value
                            )
                          }
                          className="tabular-nums mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-end text-sm font-bold text-ink"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Configurator Surcharges */}
                  {isConfiguratorSys && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Warranties & Service Requests */}
      {activeTab === "warranties" && canManageWarranties && (
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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  History,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
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
import { AuditLogPanel } from "./AuditLogPanel";
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
import { toLatinDigits, toPersianDigits } from "@/lib/persian-seo";
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

type AdminTab =
  | "tasks"
  | "inquiries"
  | "pricing"
  | "warranties"
  | "staff"
  | "audit";

const WORKSPACE_META: Record<
  AdminTab,
  { title: string; subtitle: string }
> = {
  inquiries: {
    title: "استعلام‌ها و فروش",
    subtitle: "پیگیری پرونده‌های مشتریان، پیش‌فاکتورها و فایل‌های نقشه",
  },
  tasks: {
    title: "وظایف و چک‌لیست",
    subtitle: "مدیریت کارهای روزانه، پیگیری فروش و برنامه‌ریزی اجرا",
  },
  pricing: {
    title: "نرخ دلار و فرمول قیمت",
    subtitle: "کنترل نرخ مبنای ارز و پارامترهای محاسبه قیمت محصولات",
  },
  warranties: {
    title: "ضمانت‌نامه‌ها و خدمات رگلاژ",
    subtitle: "صدور گارانتی مکتوب کارخانه و رسیدگی به درخواست‌های خدمات",
  },
  staff: {
    title: "کارکنان و دسترسی‌ها",
    subtitle: "تعریف کاربران داخلی و تنظیم دقیق سطح مجوزهای میزکار",
  },
  audit: {
    title: "گزارش وقایع سامانه",
    subtitle: "ثبت تغییرناپذیر عملیات حساس، تاریخچه قیمت و ورود کاربران",
  },
};

function resolveDefaultTab(user?: AdminUserProfile): AdminTab {
  if (!user) return "tasks";
  if (user.role === "staff") return "tasks";
  if (user.permissions.includes("inquiries:view")) return "inquiries";
  if (user.permissions.includes("pricing:view")) return "pricing";
  if (user.permissions.includes("warranties:manage")) return "warranties";
  if (user.permissions.includes("staff:manage")) return "staff";
  if (user.permissions.includes("audit:view")) return "audit";
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

function formatIranPhone(raw: string): string {
  const digits = toLatinDigits(raw).replace(/[^0-9]/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return raw;
}

function getUserInitials(fullName?: string, username?: string): string {
  const name = (fullName || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
    }
    return name.slice(0, 2);
  }
  return (username || "SP").slice(0, 2).toUpperCase();
}

function getInquiryStatusBadgeClass(status: string): string {
  if (status === "new") {
    return "border-[#E7D3B5] bg-[#FBF5EC] text-[#8A5A2B]";
  }
  if (status === "installed") {
    return "border-[#C5DDD3] bg-[#EDF5F1] text-[#234E40]";
  }
  if (status === "cancelled") {
    return "border-[#F5C6C6] bg-[#FDF2F2] text-[#991B1B]";
  }
  return "border-[#DFDBD0] bg-[#F1EFEA] text-[#3F3D39]";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const searchTimerRef = useRef<number | null>(null);

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

  const [refreshingAll, setRefreshingAll] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasPerm = useCallback(
    (perm: PermissionKey) =>
      Boolean(session.user?.permissions.includes(perm)),
    [session.user]
  );

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

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
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
      }
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

  const handleSearchQueryChange = (nextQuery: string) => {
    setSearchQuery(nextQuery);
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = window.setTimeout(() => {
      loadInquiries(statusFilter, nextQuery);
    }, 240);
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

  // Logged-Out Executive Login View
  if (!session.authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F5F1] p-4">
        <div className="w-full max-w-md rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] p-7 sm:p-8">
          <div className="flex items-center gap-3 border-b border-[#E6E2D8] pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6]">
              <BrandMark className="h-6 w-6 text-[#141413]" />
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold text-[#141413]">
                ورود به میزکار کارخانه سپنتا
              </h1>
              <p className="mt-0.5 text-xs text-[#5C5852]">
                سامانه یکپارچه فروش، تولید و خدمات پس از فروش
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-user"
                className="block text-xs font-semibold text-[#141413]"
              >
                نام کاربری
              </label>
              <input
                id="admin-user"
                type="text"
                dir="ltr"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                className="block text-xs font-semibold text-[#141413]"
              >
                رمز عبور
              </label>
              <input
                id="admin-pass"
                type="password"
                dir="ltr"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            {loginError && (
              <div
                role="alert"
                className="rounded-[3px] border border-[#F5C6C6] bg-[#FDF2F2] px-3.5 py-2.5 text-xs font-medium text-[#991B1B]"
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-[3px] bg-[#141413] px-5 py-3 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#262523] disabled:opacity-60"
            >
              {loginLoading ? "در حال بررسی..." : "ورود به میزکار"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5852] transition-colors hover:text-[#141413]"
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span>بازگشت به وبسایت سپنتا</span>
        </Link>
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
  const canViewAudit = hasPerm("audit:view");

  const openTasksCount = tasksList.filter((t) => !t.isCompleted).length;
  const openServiceCount = serviceRequests.filter(
    (s) => s.status !== "resolved"
  ).length;

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      const jobs: Promise<void>[] = [loadTasks()];
      if (canViewInquiries) jobs.push(loadInquiries());
      if (canViewPricing) {
        jobs.push(loadPricing(), loadFx());
      }
      if (canManageWarranties) jobs.push(loadWarranties());
      if (canManageStaff) jobs.push(loadStaff());
      await Promise.all(jobs);
    } finally {
      setRefreshingAll(false);
    }
  };

  type NavItemConfig = {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  };

  const navSections: { caption: string; items: NavItemConfig[] }[] = [
    {
      caption: "عملیات و فروش",
      items: [
        ...(canViewInquiries
          ? [
              {
                id: "inquiries" as const,
                label: "استعلام‌ها و فروش",
                icon: Users,
                badge: kpis.newCount > 0 ? kpis.newCount : undefined,
              },
            ]
          : []),
        {
          id: "tasks" as const,
          label: canManageStaff ? "وظایف و چک‌لیست تیم" : "شرح وظایف من",
          icon: ListChecks,
          badge: openTasksCount > 0 ? openTasksCount : undefined,
        },
      ],
    },
    {
      caption: "تولید و خدمات",
      items: [
        ...(canViewPricing
          ? [
              {
                id: "pricing" as const,
                label: "نرخ دلار و فرمول قیمت",
                icon: SlidersHorizontal,
              },
            ]
          : []),
        ...(canManageWarranties
          ? [
              {
                id: "warranties" as const,
                label: "ضمانت‌نامه‌ها و رگلاژ",
                icon: ShieldCheck,
                badge: openServiceCount > 0 ? openServiceCount : undefined,
              },
            ]
          : []),
      ],
    },
    {
      caption: "مدیریت و نظارت",
      items: [
        ...(canManageStaff
          ? [
              {
                id: "staff" as const,
                label: "کارکنان و دسترسی‌ها",
                icon: UserCog,
              },
            ]
          : []),
        ...(canViewAudit
          ? [
              {
                id: "audit" as const,
                label: "گزارش وقایع",
                icon: FileText,
              },
            ]
          : []),
      ],
    },
  ].filter((sec) => sec.items.length > 0);

  const activeMeta = WORKSPACE_META[activeTab];
  const userInitials = getUserInitials(
    currentUser?.fullName,
    currentUser?.username
  );
  const roleDisplay =
    currentUser?.userId === "root"
      ? "مدیر ارشد"
      : currentUser
        ? ROLE_LABELS[currentUser.role]
        : "کاربر";

  const sidebarContent = (onSelectTab?: () => void) => (
    <>
      {/* Top Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-[#E6E2D8] px-5">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6 text-[#141413]" />
            <span className="font-display text-sm font-extrabold text-[#141413]">
              میزکار سپنتا
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2C5E4F]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#2C5E4F]"
              aria-hidden="true"
            />
            <span>سامانه فعال</span>
          </span>
        </div>

        {/* Middle Vertical Navigation */}
        <nav
          aria-label="بخش‌های میزکار"
          className="space-y-5 px-3 py-5"
        >
          {navSections.map((section) => (
            <div key={section.caption}>
              <p className="px-3 text-[11px] font-semibold tracking-wide text-[#78716C]">
                {section.caption}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          onSelectTab?.();
                        }}
                        aria-current={active ? "page" : undefined}
                        className={`flex w-full items-center justify-between gap-2 rounded-[3px] border-s-2 px-3 py-2 text-start text-[13px] transition-colors ${
                          active
                            ? "border-[#9A6B3F] bg-[#F1EFEA] font-semibold text-[#141413]"
                            : "border-transparent font-medium text-[#5C5852] hover:bg-[#FAF9F6] hover:text-[#141413]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              active ? "text-[#9A6B3F]" : "text-[#78716C]"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span className="tabular-nums rounded-[2px] border border-[#E6E2D8] bg-[#FFFFFF] px-1.5 py-0.5 text-[11px] font-bold text-[#141413]">
                            {toPersianDigits(item.badge)}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Footer */}
      <div className="border-t border-[#E6E2D8] bg-[#FAF9F6] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141413] text-xs font-bold text-[#FAF9F6]">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#141413]">
              {currentUser?.fullName || currentUser?.username}
            </p>
            <p className="truncate text-[11px] text-[#5C5852]">
              {currentUser?.jobTitle
                ? `${currentUser.jobTitle} · ${roleDisplay}`
                : roleDisplay}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#E6E2D8] pt-3 text-xs">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#5C5852] transition-colors hover:text-[#141413]"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>نمایش سایت</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 font-medium text-[#5C5852] transition-colors hover:text-[#991B1B]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F6F5F1] text-[#141413]">
      {/* Desktop Fixed/Sticky RTL Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col justify-between border-e border-[#E6E2D8] bg-[#FFFFFF] lg:flex">
        {sidebarContent()}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="منوی میزکار"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="fixed inset-0 bg-[#141413]/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 start-0 flex w-[268px] max-w-[85vw] flex-col justify-between border-e border-[#E6E2D8] bg-[#FFFFFF]">
            <div className="flex items-center justify-end border-b border-[#E6E2D8] px-3 py-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="بستن منو"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[#E6E2D8] text-[#5C5852]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-1 flex-col justify-between overflow-y-auto">
              {sidebarContent(() => setMobileMenuOpen(false))}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Sticky Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E6E2D8] bg-[#FFFFFF] px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منوی میزکار"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] text-[#141413]"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="font-display text-sm font-bold text-[#141413]">
              {activeMeta.title}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={refreshingAll}
            className="inline-flex items-center gap-1 rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-medium text-[#141413]"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshingAll ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>بروزرسانی</span>
          </button>
        </header>

        {/* Desktop Slim Executive Header */}
        <header className="hidden h-16 items-center justify-between border-b border-[#E6E2D8] bg-[#FFFFFF] px-6 lg:flex">
          <div>
            <h1 className="font-display text-base font-extrabold text-[#141413]">
              {activeMeta.title}
            </h1>
            <p className="text-xs text-[#5C5852]">{activeMeta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5">
            {canViewPricing && fxSettings && (
              <div className="inline-flex items-center gap-2 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-1.5 text-xs">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#2C5E4F]"
                  aria-hidden="true"
                />
                <span className="text-[#5C5852]">نرخ دلار:</span>
                <span className="tabular-nums font-bold text-[#141413]">
                  {formatToman(fxSettings.active_usd_irr)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#141413] transition-colors hover:border-[#141413] disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshingAll ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>بروزرسانی</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="mx-auto w-full max-w-[1320px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Feedback Banner */}
          {feedback && (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              className={`flex items-center justify-between gap-3 rounded-[4px] border px-4 py-3 text-xs font-semibold sm:text-sm ${
                feedback.type === "success"
                  ? "border-[#C5DDD3] bg-[#EDF5F1] text-[#234E40]"
                  : "border-[#F5C6C6] bg-[#FDF2F2] text-[#991B1B]"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{feedback.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                aria-label="بستن پیام"
                className="opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* TAB: Audit Logs */}
          {activeTab === "audit" && canViewAudit && (
            <AuditLogPanel
              onUnauthorized={() => setSession({ authenticated: false })}
              onFeedback={setFeedback}
            />
          )}

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

          {/* TAB: Mini-CRM (Inquiries) */}
          {activeTab === "inquiries" && canViewInquiries && (
            <div className="space-y-5">
              {/* Unified Compact KPI Ribbon */}
              <div className="grid grid-cols-1 divide-y divide-[#E6E2D8] rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
                <div className="px-5 py-4">
                  <p className="text-xs text-[#5C5852]">
                    کل درخواست‌های ثبت‌شده
                  </p>
                  <p className="font-display tabular-nums mt-1.5 text-2xl font-bold text-[#141413]">
                    {toPersianDigits(kpis.total)} پرونده
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="flex items-center gap-2 text-xs text-[#5C5852]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9A6B3F]"
                      aria-hidden="true"
                    />
                    <span>درخواست‌های جدید (پاسخ‌داده‌نشده)</span>
                  </p>
                  <p className="font-display tabular-nums mt-1.5 text-2xl font-bold text-[#141413]">
                    {toPersianDigits(kpis.newCount)} مورد
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs text-[#5C5852]">
                    مجموع برآورد فروش فعال
                  </p>
                  <p className="font-display tabular-nums mt-1.5 text-2xl font-bold text-[#141413]">
                    {formatToman(kpis.pipelineIrr)}
                  </p>
                </div>
              </div>

              {/* Instant Filter Bar (Zero Clunky Apply Button) */}
              <div className="flex flex-wrap items-center gap-3 rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] p-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-[#5C5852]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (searchTimerRef.current) {
                          window.clearTimeout(searchTimerRef.current);
                        }
                        loadInquiries(statusFilter, searchQuery);
                      }
                    }}
                    placeholder="جستجوی فوری با کد رهگیری، نام، شماره تماس یا شهر..."
                    className="w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] py-2 ps-9 pe-8 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        loadInquiries(statusFilter, "");
                      }}
                      aria-label="پاک کردن جستجو"
                      className="absolute top-1/2 end-2.5 -translate-y-1/2 text-[#5C5852] hover:text-[#141413]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setStatusFilter(nextStatus);
                    loadInquiries(nextStatus, searchQuery);
                  }}
                  aria-label="فیلتر وضعیت"
                  className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none sm:text-sm"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  {Object.entries(INQUIRY_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scannable Executive CRM Ledger */}
              <div className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]">
                {/* Column Header Bar */}
                <div className="hidden grid-cols-12 gap-3 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-2.5 text-[11px] font-medium text-[#5C5852] md:grid">
                  <div className="col-span-2">کد رهگیری</div>
                  <div className="col-span-3">مشتری و شهر</div>
                  <div className="col-span-2">سیستم / نوع پروژه</div>
                  <div className="col-span-2">برآورد (تومان)</div>
                  <div className="col-span-2">وضعیت</div>
                  <div className="col-span-1 text-end">تاریخ</div>
                </div>

                {inquiries.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#5C5852]">
                    درخواستی مطابق فیلتر فعلی یافت نشد.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E6E2D8]">
                    {inquiries.map((inq) => {
                      const isExpanded = expandedId === inq.id;
                      return (
                        <div key={inq.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : inq.id)
                            }
                            aria-expanded={isExpanded}
                            className="grid w-full grid-cols-1 items-center gap-3 px-5 py-3.5 text-start transition-colors hover:bg-[#FAF9F6] md:grid-cols-12"
                          >
                            {/* Tracking Code */}
                            <div className="flex items-center justify-between md:col-span-2 md:justify-start">
                              <span
                                dir="ltr"
                                className="inline-block rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-[#141413]"
                              >
                                {inq.trackingCode}
                              </span>
                              <span className="text-[11px] text-[#5C5852] md:hidden">
                                {formatFaDate(inq.createdAt)}
                              </span>
                            </div>

                            {/* Customer & City + Formatted LTR Phone */}
                            <div className="min-w-0 md:col-span-3">
                              <p className="truncate text-sm font-bold text-[#141413]">
                                {inq.customerName} — {inq.city}
                              </p>
                              <p className="mt-0.5 text-xs text-[#5C5852]">
                                <span
                                  dir="ltr"
                                  className="tabular-nums inline-block font-medium"
                                >
                                  {formatIranPhone(inq.phone)}
                                </span>
                              </p>
                            </div>

                            {/* Project Type */}
                            <div className="min-w-0 text-xs font-medium text-[#5C5852] md:col-span-2">
                              <span className="line-clamp-1">
                                {inq.projectType}
                              </span>
                            </div>

                            {/* Estimate */}
                            <div className="md:col-span-2">
                              {inq.estimatedTotalIrr > 0 ? (
                                <span className="tabular-nums text-xs font-semibold text-[#141413] sm:text-sm">
                                  {formatToman(inq.estimatedTotalIrr)}
                                </span>
                              ) : (
                                <span className="text-xs text-[#78716C]">—</span>
                              )}
                            </div>

                            {/* Status Pill */}
                            <div className="md:col-span-2">
                              <span
                                className={`inline-flex items-center rounded-[2px] border px-2 py-0.5 text-[11px] font-semibold ${getInquiryStatusBadgeClass(
                                  inq.status
                                )}`}
                              >
                                {INQUIRY_STATUS_LABELS[inq.status] ?? inq.status}
                              </span>
                            </div>

                            {/* Date + Expand Chevron */}
                            <div className="hidden items-center justify-end gap-2 md:col-span-1 md:flex">
                              <span className="tabular-nums text-[11px] text-[#5C5852]">
                                {formatFaDate(inq.createdAt)}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-[#78716C] transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="space-y-4 border-t border-[#E6E2D8] bg-[#FAF9F6] p-4 sm:p-6">
                              {inq.notes && (
                                <div className="rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] p-3.5 text-xs leading-6 text-[#141413]">
                                  <strong>توضیحات مشتری:</strong> {inq.notes}
                                </div>
                              )}

                              {inq.attachmentPath && canDownloadUploads && (
                                <div>
                                  <a
                                    href={`/api/admin/uploads/${encodeURIComponent(inq.attachmentPath)}/`}
                                    className="inline-flex items-center gap-2 rounded-[3px] border border-[#E7D3B5] bg-[#FBF5EC] px-4 py-2 text-xs font-semibold text-[#8A5A2B] hover:border-[#9A6B3F]"
                                  >
                                    <Download
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                    <span>
                                      دانلود فایل پیوست:{" "}
                                      {inq.attachmentOriginalName ||
                                        inq.attachmentPath}
                                    </span>
                                  </a>
                                </div>
                              )}

                              {inq.items.length > 0 && (
                                <div className="divide-y divide-[#E6E2D8] rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF]">
                                  {inq.items.map((item, idx) => (
                                    <div
                                      key={`${inq.id}-item-${idx}`}
                                      className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs"
                                    >
                                      <span className="font-semibold text-[#141413]">
                                        {toPersianDigits(idx + 1)}.{" "}
                                        {item.locationName || "دهانه"} —{" "}
                                        {SYSTEM_RULES[item.system]?.shortLabel ??
                                          item.system}{" "}
                                        ({toPersianDigits(item.widthCm)}×
                                        {toPersianDigits(item.heightCm)}{" "}
                                        سانتی‌متر ·{" "}
                                        {toPersianDigits(item.quantity)} عدد ·{" "}
                                        {GLASS_OPTIONS[item.glassType]
                                          ?.shortLabel ?? item.glassType}{" "}
                                        ·{" "}
                                        {FRAME_FINISHES[item.finish]?.label ??
                                          item.finish}
                                        )
                                      </span>
                                      {item.breakdown?.totalIrr ? (
                                        <span className="tabular-nums font-semibold text-[#141413]">
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
                                    <label className="block text-xs font-semibold text-[#141413]">
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
                                      className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:outline-none"
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
                                    <label className="block text-xs font-semibold text-[#141413]">
                                      یادداشت داخلی کارشناس (فقط میزکار)
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
                                      className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:outline-none"
                                    />
                                  </div>

                                  <div className="flex items-end md:col-span-2">
                                    <button
                                      type="button"
                                      disabled={savingInquiryId === inq.id}
                                      onClick={() => handleSaveInquiry(inq.id)}
                                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-[3px] bg-[#141413] px-4 py-2 text-xs font-semibold text-[#FAF9F6] hover:bg-[#262523] disabled:opacity-60"
                                    >
                                      <Save
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                      />
                                      <span>
                                        {savingInquiryId === inq.id
                                          ? "ذخیره..."
                                          : "ذخیره"}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                inq.adminNotes && (
                                  <div className="rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] p-3.5 text-xs text-[#5C5852]">
                                    <strong>یادداشت کارشناس:</strong>{" "}
                                    {inq.adminNotes}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Live FX & Formula Pricing Editor */}
          {activeTab === "pricing" && canViewPricing && (
            <div className="space-y-6">
              {!canEditPricing && (
                <div className="rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] px-4 py-3 text-xs font-semibold text-[#5C5852]">
                  دسترسی شما به این بخش فقط‌خواندنی است؛ برای ویرایش نرخ دلار یا
                  فرمول کالاها مجوز «ویرایش تعرفه و فرمول کالاها» لازم است.
                </div>
              )}

              {/* FX Control Panel */}
              <section className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign
                        className="h-4 w-4 text-[#9A6B3F]"
                        aria-hidden="true"
                      />
                      <h2 className="font-display text-sm font-bold text-[#141413] sm:text-base">
                        مدیریت نرخ لحظه‌ای دلار و همگام‌سازی سرور
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-[#5C5852]">
                      با تغییر نرخ دلار، قیمت پایه تمامی محصولات در{" "}
                      <span dir="ltr">/products/</span> و{" "}
                      <span dir="ltr">/configurator/</span> به‌صورت اتمیک
                      بازمحاسبه می‌شوند.
                    </p>
                  </div>

                  {canEditPricing && (
                    <button
                      type="button"
                      disabled={syncingFx}
                      onClick={handleSyncFxNow}
                      className="inline-flex items-center gap-2 rounded-[3px] border border-[#CEC8BA] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#141413] transition-colors hover:border-[#141413] disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-[#9A6B3F] ${
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
                  <div className="space-y-5 p-5 sm:p-6">
                    {/* Active Rate Unified Ribbon */}
                    <div className="grid grid-cols-1 divide-y divide-[#E6E2D8] rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
                      <div className="px-5 py-4">
                        <p className="flex items-center gap-1.5 text-xs text-[#5C5852]">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-[#9A6B3F]"
                            aria-hidden="true"
                          />
                          <span>نرخ فعال مبنای محاسبه</span>
                        </p>
                        <p className="font-display tabular-nums mt-1.5 text-xl font-bold text-[#141413]">
                          {formatToman(fxSettings.active_usd_irr)}
                        </p>
                        <p className="tabular-nums mt-0.5 text-[11px] text-[#5C5852]">
                          معادل {formatIrr(fxSettings.active_usd_irr)}
                        </p>
                      </div>

                      <div className="px-5 py-4">
                        <p className="text-xs text-[#5C5852]">
                          منبع و وضعیت فعلی
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-[2px] border border-[#E7D3B5] bg-[#FBF5EC] px-2.5 py-0.5 text-xs font-semibold text-[#8A5A2B]">
                            {getFxSourceLabel(fxSettings.source_used)}
                          </span>
                          <span className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2.5 py-0.5 text-xs font-medium text-[#3F3D39]">
                            {fxSettings.mode === "auto"
                              ? "حالت خودکار"
                              : "حالت دستی"}
                          </span>
                        </div>
                      </div>

                      <div className="px-5 py-4">
                        <p className="text-xs text-[#5C5852]">
                          آخرین همگام‌سازی موفق
                        </p>
                        <p className="mt-1.5 text-sm font-bold text-[#141413]">
                          {formatFxTimestamp(fxSettings.last_synced_at)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#5C5852]">
                          کش خودکار هر{" "}
                          {toPersianDigits(fxSettings.sync_interval_minutes)}{" "}
                          دقیقه
                        </p>
                      </div>
                    </div>

                    {fxSettings.last_error && (
                      <div className="flex items-start gap-2 rounded-[3px] border border-[#E2D3BC] bg-[#FBF8F3] px-4 py-3 text-xs text-[#5C4428]">
                        <AlertTriangle
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6B3F]"
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
                      <div className="grid grid-cols-1 gap-4 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] p-4 md:grid-cols-12">
                        <div className="md:col-span-4">
                          <p className="text-xs font-semibold text-[#141413]">
                            حالت دریافت نرخ دلار
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setFxModeDraft("auto")}
                              aria-pressed={fxModeDraft === "auto"}
                              className={`rounded-[3px] px-3 py-2 text-xs font-semibold transition-colors ${
                                fxModeDraft === "auto"
                                  ? "bg-[#141413] text-[#FAF9F6]"
                                  : "border border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:text-[#141413]"
                              }`}
                            >
                              خودکار از سرور
                            </button>
                            <button
                              type="button"
                              onClick={() => setFxModeDraft("manual")}
                              aria-pressed={fxModeDraft === "manual"}
                              className={`rounded-[3px] px-3 py-2 text-xs font-semibold transition-colors ${
                                fxModeDraft === "manual"
                                  ? "bg-[#141413] text-[#FAF9F6]"
                                  : "border border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:text-[#141413]"
                              }`}
                            >
                              نرخ دستی مدیر
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label
                            htmlFor="fx-manual-usd"
                            className="block text-xs font-semibold text-[#141413]"
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
                            className="tabular-nums mt-2 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413] focus:border-[#9A6B3F] focus:outline-none"
                          />
                          <p className="tabular-nums mt-1 text-[11px] text-[#5C5852]">
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
                            className="block text-xs font-semibold text-[#141413]"
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
                            onChange={(e) =>
                              setSyncIntervalDraft(e.target.value)
                            }
                            className="tabular-nums mt-2 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413] focus:border-[#9A6B3F] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-end md:col-span-3">
                          <button
                            type="button"
                            disabled={savingFx}
                            onClick={handleSaveFxSettings}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-[3px] bg-[#141413] px-4 py-2.5 text-xs font-semibold text-[#FAF9F6] hover:bg-[#262523] disabled:opacity-60"
                          >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            <span>
                              {savingFx
                                ? "در حال ذخیره..."
                                : "ذخیره تنظیمات ارز"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Recent FX Rate History */}
                    {fxHistory.length > 0 && (
                      <div className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#141413]">
                          <History
                            className="h-4 w-4 text-[#9A6B3F]"
                            aria-hidden="true"
                          />
                          <span>
                            تاریخچه تغییرات نرخ دلار (
                            {toPersianDigits(fxHistory.length)} مورد اخیر)
                          </span>
                        </div>
                        <div className="mt-3 max-h-44 divide-y divide-[#E6E2D8] overflow-y-auto rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] text-xs">
                          {fxHistory.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 font-medium text-[#141413]">
                                  {getFxSourceLabel(item.source)}
                                </span>
                                <span className="text-[#5C5852]">
                                  {formatFxTimestamp(item.recorded_at)}
                                </span>
                              </div>
                              <span className="tabular-nums font-bold text-[#141413]">
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

              <p className="text-xs leading-6 text-[#5C5852] sm:text-sm">
                فرمول قیمت‌گذاری هر کالا بر اساس{" "}
                <span dir="ltr" className="font-mono font-semibold text-[#141413]">
                  (نرخ دلار × ضریب ارزی × ضریب فرمول) + هزینه ثابت
                </span>{" "}
                محاسبه و بر اساس گام رندسازی به ریال گرد می‌شود. تمامی مبالغ
                ورودی فرمول بر حسب <strong>ریال</strong> هستند.
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
                      className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-3.5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-sm font-bold text-[#141413] sm:text-base">
                              {rule.label}
                            </h2>
                            <span className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-medium text-[#3F3D39]">
                              {unitLabel}
                            </span>
                          </div>
                          <p
                            dir="ltr"
                            className="font-mono text-[11px] text-[#5C5852]"
                          >
                            {rule.system_key}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="rounded-[3px] border border-[#E7D3B5] bg-[#FBF5EC] px-3.5 py-1.5 text-end text-xs">
                            <p className="text-[11px] text-[#8A5A2B]">
                              پیش‌نمایش قیمت فرمول ({unitLabel})
                            </p>
                            <p className="font-display tabular-nums font-bold text-[#141413]">
                              {formatToman(previewIrr)}
                            </p>
                          </div>

                          {canEditPricing && (
                            <button
                              type="button"
                              disabled={savingPricingKey === rule.system_key}
                              onClick={() => handleSavePricingRule(rule)}
                              className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#141413] px-4 py-2 text-xs font-semibold text-[#FAF9F6] hover:bg-[#262523] disabled:opacity-60"
                            >
                              <Save className="h-4 w-4" aria-hidden="true" />
                              <span>
                                {savingPricingKey === rule.system_key
                                  ? "در حال ذخیره..."
                                  : "ذخیره فرمول"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 p-5">
                        {/* Formula Parameters */}
                        <div className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-[#141413]">
                              پارامترهای فرمول متصل به دلار
                            </span>
                            <span className="tabular-nums text-[11px] text-[#5C5852]">
                              مقدار ذخیره‌شده فعلی:{" "}
                              <strong className="text-[#141413]">
                                {formatToman(rule.computed_price_per_sqm)}
                              </strong>
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Technical Configurator Surcharges */}
                        {isConfiguratorSys && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
                                حداقل متراژ محاسبه (مترمربع)
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
                                توری پلیسه همرنگ (ریال/مترمربع)
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#5C5852]">
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
                                className="tabular-nums mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm font-bold text-[#141413]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Warranties & Service Requests */}
          {activeTab === "warranties" && canManageWarranties && (
            <div className="space-y-6">
              {/* Issue New Warranty */}
              <form
                onSubmit={handleCreateWarranty}
                className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]"
              >
                <div className="flex items-center gap-2 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-3.5">
                  <Plus className="h-4 w-4 text-[#9A6B3F]" aria-hidden="true" />
                  <h2 className="font-display text-sm font-bold text-[#141413] sm:text-base">
                    صدور ضمانت‌نامه جدید کارخانه
                  </h2>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      type="text"
                      required
                      placeholder="نام کارفرما / پروژه *"
                      value={newWarranty.customerName}
                      onChange={(e) =>
                        setNewWarranty({
                          ...newWarranty,
                          customerName: e.target.value,
                        })
                      }
                      className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
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
                      className="tabular-nums rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="شهر *"
                      value={newWarranty.city}
                      onChange={(e) =>
                        setNewWarranty({ ...newWarranty, city: e.target.value })
                      }
                      className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="سیستم اجراشده *"
                      value={newWarranty.systemName}
                      onChange={(e) =>
                        setNewWarranty({
                          ...newWarranty,
                          systemName: e.target.value,
                        })
                      }
                      className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
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
                      className="tabular-nums rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="تاریخ صدور (1405/09/05)"
                      value={newWarranty.issuedDate}
                      onChange={(e) =>
                        setNewWarranty({
                          ...newWarranty,
                          issuedDate: e.target.value,
                        })
                      }
                      className="tabular-nums rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="تاریخ انقضا (1420/09/05)"
                      value={newWarranty.expiresDate}
                      onChange={(e) =>
                        setNewWarranty({
                          ...newWarranty,
                          expiresDate: e.target.value,
                        })
                      }
                      className="tabular-nums rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="سریال دلخواه (اختیاری)"
                      value={newWarranty.serialCode}
                      onChange={(e) =>
                        setNewWarranty({
                          ...newWarranty,
                          serialCode: e.target.value,
                        })
                      }
                      className="font-mono rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingWarranty}
                    className="mt-4 inline-flex items-center gap-2 rounded-[3px] bg-[#141413] px-5 py-2.5 text-xs font-semibold text-[#FAF9F6] hover:bg-[#262523] disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {creatingWarranty
                        ? "در حال صدور..."
                        : "صدور و ثبت ضمانت‌نامه"}
                    </span>
                  </button>
                </div>
              </form>

              {/* Warranties Ledger */}
              <div className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]">
                <div className="flex items-center justify-between border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-3">
                  <h2 className="font-display text-sm font-bold text-[#141413]">
                    فهرست ضمانت‌نامه‌های صادرشده (
                    {toPersianDigits(warranties.length)})
                  </h2>
                </div>

                <div className="divide-y divide-[#E6E2D8]">
                  {warranties.map((w) => (
                    <div
                      key={w.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs hover:bg-[#FAF9F6] sm:px-5"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            dir="ltr"
                            className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 font-mono font-semibold text-[#141413]"
                          >
                            {w.serial_code}
                          </span>
                          <span className="font-bold text-[#141413]">
                            {w.customer_name}
                          </span>
                          <span className="text-[#5C5852]">({w.city})</span>
                        </div>
                        <p className="mt-1 text-[#5C5852]">
                          {w.system_name} ·{" "}
                          <span
                            dir="ltr"
                            className="tabular-nums inline-block font-medium"
                          >
                            {formatIranPhone(w.phone)}
                          </span>{" "}
                          · اعتبار تا {toPersianDigits(w.expires_date)}
                        </p>
                      </div>

                      <span className="rounded-[2px] border border-[#C5DDD3] bg-[#EDF5F1] px-2.5 py-0.5 font-semibold text-[#234E40]">
                        {WARRANTY_STATUS_LABELS[w.status] ?? w.status} (
                        {toPersianDigits(w.warranty_years)} سال)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Requests Ledger */}
              <div className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]">
                <div className="border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-3">
                  <h2 className="font-display text-sm font-bold text-[#141413]">
                    درخواست‌های خدمات و رگلاژ مشتریان (
                    {toPersianDigits(serviceRequests.length)})
                  </h2>
                </div>

                {serviceRequests.length === 0 ? (
                  <p className="p-6 text-xs text-[#5C5852]">
                    درخواست خدمات جدیدی ثبت نشده است.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E6E2D8]">
                    {serviceRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col justify-between gap-3 p-4 text-xs hover:bg-[#FAF9F6] sm:flex-row sm:items-center sm:px-5"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              dir="ltr"
                              className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 font-mono font-semibold text-[#141413]"
                            >
                              {req.tracking_code}
                            </span>
                            <span className="font-bold text-[#141413]">
                              {req.customer_name} ({req.city})
                            </span>
                            <span
                              dir="ltr"
                              className="font-mono text-[#5C5852]"
                            >
                              [{req.serial_code}]
                            </span>
                          </div>
                          <p className="font-semibold text-[#141413]">
                            {SERVICE_REQUEST_TYPE_LABELS[req.request_type] ??
                              req.request_type}
                          </p>
                          <p className="text-[#5C5852]">{req.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={req.status}
                            disabled={savingServiceId === req.id}
                            onChange={(e) =>
                              handleUpdateServiceStatus(req.id, e.target.value)
                            }
                            aria-label={`وضعیت درخواست ${req.tracking_code}`}
                            className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
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
        </main>
      </div>
    </div>
  );
}

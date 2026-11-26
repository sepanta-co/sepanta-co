"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  Download,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  type AuditAction,
  type AuditEntityType,
} from "@/lib/audit-constants";
import { toPersianDigits } from "@/lib/persian-seo";
import { ROLE_LABELS, type StaffRole } from "@/lib/permissions";

export interface AuditLogItem {
  id: number;
  actorUserId: string;
  actorUsername: string;
  actorFullName: string;
  actorRole: StaffRole;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  detailsJson: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string;
  createdAt: string;
}

function formatAuditDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AuditLogPanel({
  onUnauthorized,
  onFeedback,
}: {
  onUnauthorized: () => void;
  onFeedback: (feedback: { type: "success" | "error"; text: string }) => void;
}) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [actors, setActors] = useState<string[]>([]);
  const [actorFilter, setActorFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const buildQueryString = useCallback(
    (
      targetPage: number,
      includeFormatCsv = false,
      actorOverride = actorFilter,
      entityOverride = entityFilter
    ) => {
      const params = new URLSearchParams();
      if (actorOverride && actorOverride !== "all") {
        params.set("actor", actorOverride);
      }
      if (entityOverride && entityOverride !== "all") {
        params.set("entityType", entityOverride);
      }
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (includeFormatCsv) {
        params.set("format", "csv");
      } else {
        params.set("page", String(targetPage));
        params.set("limit", "25");
      }
      return params.toString();
    },
    [actorFilter, entityFilter, searchQuery]
  );

  const loadLogs = useCallback(
    async (
      targetPage = page,
      actorOverride = actorFilter,
      entityOverride = entityFilter
    ) => {
      setLoading(true);
      try {
        const qs = buildQueryString(
          targetPage,
          false,
          actorOverride,
          entityOverride
        );
        const res = await fetch(`/api/admin/audit-logs/?${qs}`, {
          cache: "no-store",
        });
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          logs?: AuditLogItem[];
          total?: number;
          page?: number;
          totalPages?: number;
          actors?: string[];
        };
        if (!res.ok || !data.ok) {
          onFeedback({
            type: "error",
            text: data.error || "خطا در دریافت گزارش وقایع.",
          });
          return;
        }
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
        setPage(data.page ?? targetPage);
        setTotalPages(data.totalPages ?? 1);
        setActors(data.actors ?? []);
      } catch {
        onFeedback({ type: "error", text: "خطا در برقراری ارتباط با سرور." });
      } finally {
        setLoading(false);
      }
    },
    [actorFilter, buildQueryString, entityFilter, onFeedback, onUnauthorized, page]
  );

  useEffect(() => {
    let active = true;

    fetch("/api/admin/audit-logs/?page=1&limit=25", { cache: "no-store" })
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          logs?: AuditLogItem[];
          total?: number;
          page?: number;
          totalPages?: number;
          actors?: string[];
        };
        if (!active) return;
        if (!res.ok || !data.ok) {
          onFeedback({
            type: "error",
            text: data.error || "خطا در دریافت گزارش وقایع.",
          });
          return;
        }
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
        setPage(data.page ?? 1);
        setTotalPages(data.totalPages ?? 1);
        setActors(data.actors ?? []);
      })
      .catch(() => {
        if (active) {
          onFeedback({ type: "error", text: "خطا در برقراری ارتباط با سرور." });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [onFeedback, onUnauthorized]);

  const csvDownloadUrl = `/api/admin/audit-logs/?${buildQueryString(1, true)}`;

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-bronze" aria-hidden="true" />
            <div>
              <h2 className="text-base font-extrabold text-charcoal sm:text-lg">
                گزارش وقایع و تاریخچه عملکرد (Append-Only)
              </h2>
              <p className="text-xs text-ink-muted">
                تمامی عملیات حساس مدیر و کارکنان با زمان، آدرس IP و جزئیات
                تغییرات بدون امکان حذف یا دستکاری ثبت می‌شوند.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadLogs(page)}
              className="inline-flex items-center gap-1.5 rounded-[2px] border border-border bg-surface-subtle px-3.5 py-2 text-xs font-semibold text-ink hover:border-charcoal"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>بروزرسانی</span>
            </button>

            <a
              href={csvDownloadUrl}
              className="inline-flex items-center gap-1.5 rounded-[3px] bg-charcoal px-4 py-2 text-xs font-semibold text-canvas hover:bg-charcoal-soft"
            >
              <Download className="h-3.5 w-3.5 text-bronze" aria-hidden="true" />
              <span>خروجی اکسل (CSV)</span>
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search
              className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadLogs(1);
                }
              }}
              placeholder="جستجو در شرح واقعه، شناسه، نام یا نام کاربری..."
              className="w-full rounded-[2px] border border-border bg-surface-subtle py-2.5 ps-10 pe-3.5 text-xs text-ink focus:border-bronze focus:outline-none sm:text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={actorFilter}
              onChange={(e) => {
                const nextActor = e.target.value;
                setActorFilter(nextActor);
                loadLogs(1, nextActor, entityFilter);
              }}
              aria-label="فیلتر کاربر"
              className="w-full rounded-[2px] border border-border bg-surface-subtle px-3 py-2.5 text-xs font-semibold text-ink focus:border-bronze focus:outline-none sm:text-sm"
            >
              <option value="all">همه کاربران</option>
              {actors.map((username) => (
                <option key={username} value={username}>
                  @{username}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={entityFilter}
              onChange={(e) => {
                const nextEntity = e.target.value;
                setEntityFilter(nextEntity);
                loadLogs(1, actorFilter, nextEntity);
              }}
              aria-label="فیلتر بخش"
              className="w-full rounded-[2px] border border-border bg-surface-subtle px-3 py-2.5 text-xs font-semibold text-ink focus:border-bronze focus:outline-none sm:text-sm"
            >
              <option value="all">همه بخش‌ها</option>
              {Object.entries(AUDIT_ENTITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => loadLogs(1)}
              className="w-full rounded-[3px] bg-charcoal px-4 py-2.5 text-xs font-semibold text-canvas hover:bg-charcoal-soft sm:text-sm"
            >
              جستجو
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Timeline / Table */}
      <div className="overflow-hidden border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-subtle px-5 py-3 text-xs">
          <span className="font-bold text-ink">
            مجموع وقایع ثبت‌شده: {toPersianDigits(total)} مورد
          </span>
          <span className="tabular-nums text-ink-muted">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
          </span>
        </div>

        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-muted">
            در حال بارگذاری گزارش وقایع...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-muted">
            هیچ واقعه‌ای مطابق فیلتر انتخاب‌شده یافت نشد.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              const actionLabel =
                AUDIT_ACTION_LABELS[log.action as AuditAction] ?? log.action;
              const entityLabel =
                AUDIT_ENTITY_LABELS[log.entityType as AuditEntityType] ??
                log.entityType;

              return (
                <div key={log.id} className="p-4 transition-colors hover:bg-surface-subtle/50 sm:px-5">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[2px] bg-charcoal px-2 py-0.5 text-[11px] font-bold text-bronze">
                          {actionLabel}
                        </span>
                        <span className="rounded-[2px] bg-bronze-soft px-2 py-0.5 text-[11px] font-bold text-bronze-hover">
                          {entityLabel}
                        </span>
                        {log.entityId && (
                          <span
                            dir="ltr"
                            className="rounded-[2px] border border-border bg-surface-subtle px-2 py-0.5 font-mono text-[11px] font-semibold text-ink"
                          >
                            {log.entityId}
                          </span>
                        )}
                        <span className="text-xs font-bold text-ink">
                          {log.actorFullName}
                        </span>
                        <span className="rounded-[2px] bg-surface-subtle px-2 py-0.5 text-[11px] text-ink-muted">
                          {ROLE_LABELS[log.actorRole] ?? log.actorRole} (
                          <span dir="ltr" className="font-mono">
                            @{log.actorUsername}
                          </span>
                          )
                        </span>
                      </div>

                      <p className="text-xs leading-6 font-medium text-ink sm:text-sm">
                        {log.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                      <div className="tabular-nums text-start text-[11px] text-ink-muted lg:text-end">
                        <p className="font-semibold text-ink">
                          {formatAuditDateTime(log.createdAt)}
                        </p>
                        <p dir="ltr" className="font-mono">
                          IP: {log.ipAddress}
                        </p>
                      </div>

                      {log.details && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : log.id)
                          }
                          aria-expanded={isExpanded}
                          className="inline-flex items-center gap-1 rounded-[2px] border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink hover:border-charcoal"
                        >
                          <span>جزئیات تغییرات</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && log.details && (
                    <div className="mt-3 rounded-[2px] border border-border bg-surface-subtle p-3.5">
                      <p className="mb-2 text-[11px] font-bold text-ink-muted">
                        جزئیات تغییرات (قبل / بعد):
                      </p>
                      <pre
                        dir="ltr"
                        className="overflow-x-auto text-start font-mono text-xs leading-5 text-ink"
                      >
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-surface-subtle px-5 py-3 text-xs">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => loadLogs(page - 1)}
              className="rounded-[2px] border border-border bg-surface px-3.5 py-2 font-semibold text-ink hover:border-charcoal disabled:opacity-50"
            >
              صفحه قبل
            </button>

            <span className="tabular-nums font-bold text-ink">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => loadLogs(page + 1)}
              className="rounded-[2px] border border-border bg-surface px-3.5 py-2 font-semibold text-ink hover:border-charcoal disabled:opacity-50"
            >
              صفحه بعد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

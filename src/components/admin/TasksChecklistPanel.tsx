"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { formatFxTimestamp } from "@/lib/fx-labels";
import { toPersianDigits } from "@/lib/persian-seo";
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  type TaskCategory,
  type TaskPriority,
} from "@/lib/permissions";
import type { StaffMemberItem } from "./StaffManagementPanel";

export interface StaffTaskItem {
  id: number;
  staffUserId: number;
  staffUsername: string;
  staffFullName: string;
  staffJobTitle: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  dueLabel: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  completedByUsername: string | null;
  assignedByUsername: string;
  createdAt: string;
  updatedAt: string;
}

const PRESET_DUTIES: readonly {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueLabel: string;
}[] = [
  {
    title: "پیگیری استعلام‌های جدید امروز",
    category: "sales",
    priority: "high",
    dueLabel: "روزانه تا ساعت ۱۴",
  },
  {
    title: "هماهنگی اندازه‌گیری پروژه",
    category: "production",
    priority: "normal",
    dueLabel: "حداکثر ۲۴ ساعت پس از ثبت",
  },
  {
    title: "بررسی و بروزرسانی نرخ دلار",
    category: "daily",
    priority: "high",
    dueLabel: "هر روز صبح ساعت ۹",
  },
  {
    title: "پیگیری درخواست‌های رگلاژ باز",
    category: "warranty",
    priority: "normal",
    dueLabel: "اولویت هفتگی",
  },
  {
    title: "تماس تایید پیش‌فاکتور با کارفرما",
    category: "sales",
    priority: "normal",
    dueLabel: "تا پایان شیفت",
  },
];

interface TasksChecklistPanelProps {
  tasks: StaffTaskItem[];
  staffList: StaffMemberItem[];
  canManageStaff: boolean;
  selectedStaffFilter: string;
  onSelectedStaffFilterChange: (value: string) => void;
  defaultAssignStaffId?: number | null;
  onRefreshTasks: () => Promise<void>;
  onFeedback: (feedback: { type: "success" | "error"; text: string }) => void;
}

export function TasksChecklistPanel({
  tasks,
  staffList,
  canManageStaff,
  selectedStaffFilter,
  onSelectedStaffFilterChange,
  defaultAssignStaffId,
  onRefreshTasks,
  onFeedback,
}: TasksChecklistPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "completed">(
    "all"
  );

  const [assignStaffId, setAssignStaffId] = useState<string>(() => {
    if (defaultAssignStaffId) return String(defaultAssignStaffId);
    return staffList[0] ? String(staffList[0].id) : "";
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("daily");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [dueLabel, setDueLabel] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const effectiveAssignStaffId =
    assignStaffId ||
    (defaultAssignStaffId ? String(defaultAssignStaffId) : "") ||
    (staffList[0] ? String(staffList[0].id) : "");

  const visibleTasks = tasks.filter((task) => {
    if (
      canManageStaff &&
      selectedStaffFilter !== "all" &&
      String(task.staffUserId) !== selectedStaffFilter
    ) {
      return false;
    }
    if (statusFilter === "open" && task.isCompleted) return false;
    if (statusFilter === "completed" && !task.isCompleted) return false;
    return true;
  });

  const completedCount = visibleTasks.filter((t) => t.isCompleted).length;
  const totalCount = visibleTasks.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!effectiveAssignStaffId) {
      onFeedback({
        type: "error",
        text: "ابتدا از بخش کارکنان حداقل یک کارمند تعریف کنید.",
      });
      return;
    }

    setCreatingTask(true);
    try {
      const res = await fetch("/api/admin/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffUserId: Number(effectiveAssignStaffId),
          title,
          description,
          category,
          priority,
          dueLabel,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        task?: StaffTaskItem;
      };
      if (!res.ok || !data.ok || !data.task) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در ثبت وظیفه جدید.",
        });
        return;
      }

      setTitle("");
      setDescription("");
      setDueLabel("");
      await onRefreshTasks();
      onFeedback({
        type: "success",
        text: `وظیفه «${data.task.title}» برای ${data.task.staffFullName} ثبت شد.`,
      });
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setCreatingTask(false);
    }
  };

  const handleQuickPresetAdd = async (preset: (typeof PRESET_DUTIES)[number]) => {
    if (!effectiveAssignStaffId) {
      onFeedback({
        type: "error",
        text: "ابتدا کارمند مقصد را انتخاب کنید (یا در بخش کارکنان یک کارمند بسازید).",
      });
      return;
    }
    setCreatingTask(true);
    try {
      const res = await fetch("/api/admin/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffUserId: Number(effectiveAssignStaffId),
          title: preset.title,
          category: preset.category,
          priority: preset.priority,
          dueLabel: preset.dueLabel,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        task?: StaffTaskItem;
      };
      if (!res.ok || !data.ok || !data.task) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در افزودن وظیفه آماده.",
        });
        return;
      }
      await onRefreshTasks();
      onFeedback({
        type: "success",
        text: `وظیفه «${preset.title}» به چک‌لیست ${data.task.staffFullName} اضافه شد.`,
      });
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setCreatingTask(false);
    }
  };

  const handleToggleTask = async (task: StaffTaskItem) => {
    setTogglingId(task.id);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در تغییر وضعیت وظیفه.",
        });
        return;
      }
      await onRefreshTasks();
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteTask = async (task: StaffTaskItem) => {
    setDeletingId(task.id);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}/`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در حذف وظیفه.",
        });
        return;
      }
      await onRefreshTasks();
      onFeedback({ type: "success", text: `وظیفه «${task.title}» حذف شد.` });
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manager Assignment Bar */}
      {canManageStaff && (
        <form
          onSubmit={handleCreateTask}
          className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <ListChecks
                className="h-4 w-4 text-[#9A6B3F]"
                aria-hidden="true"
              />
              <h2 className="font-display text-sm font-bold text-[#141413] sm:text-base">
                تعریف شرح وظایف و چک‌لیست کارمندان
              </h2>
            </div>
            <span className="text-xs text-[#5C5852]">
              کارمندان با تیک زدن هر مورد، انجام کار را ثبت می‌کنند.
            </span>
          </div>

          <div className="p-5 sm:p-6">
            {staffList.length === 0 ? (
              <p className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] p-4 text-xs text-[#5C5852]">
                برای تعریف شرح وظایف، ابتدا از بخش «کارکنان و دسترسی‌ها» حداقل یک
                کارمند اضافه کنید.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      کارمند مسئول *
                    </label>
                    <select
                      value={effectiveAssignStaffId}
                      onChange={(e) => setAssignStaffId(e.target.value)}
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    >
                      {staffList.map((emp) => (
                        <option key={emp.id} value={String(emp.id)}>
                          {emp.fullName} ({emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      عنوان وظیفه / چک‌لیست *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثلاً: تماس با استعلام‌های جدید زنجان"
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      دسته‌بندی
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TaskCategory)}
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    >
                      {Object.entries(TASK_CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      اولویت
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    >
                      {Object.entries(TASK_PRIORITY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      زمان‌بندی / مهلت (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={dueLabel}
                      onChange={(e) => setDueLabel(e.target.value)}
                      placeholder="مثلاً: روزانه تا ساعت ۱۴"
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات تکمیلی شرح وظیفه (اختیاری)..."
                    className="min-w-[240px] flex-1 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-xs text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={creatingTask}
                    className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#141413] px-5 py-2 text-xs font-semibold text-[#FAF9F6] hover:bg-[#262523] disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {creatingTask ? "در حال ثبت..." : "افزودن به چک‌لیست"}
                    </span>
                  </button>
                </div>

                {/* 1-Click Duty Presets */}
                <div className="mt-4 border-t border-[#E6E2D8] pt-3">
                  <p className="text-[11px] font-semibold text-[#5C5852]">
                    افزودن سریع شرح وظایف آماده برای کارمند انتخاب‌شده:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESET_DUTIES.map((preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        disabled={creatingTask}
                        onClick={() => handleQuickPresetAdd(preset)}
                        className="inline-flex items-center gap-1 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 py-1.5 text-[11px] font-semibold text-[#141413] transition-colors hover:border-[#141413] disabled:opacity-50"
                      >
                        <Plus
                          className="h-3 w-3 text-[#9A6B3F]"
                          aria-hidden="true"
                        />
                        <span>{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      )}

      {/* Progress & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] p-4 sm:p-5">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#141413]">
                {canManageStaff
                  ? "پیشرفت چک‌لیست وظایف"
                  : "پیشرفت شرح وظایف من"}
              </span>
              <span className="tabular-nums font-bold text-[#8A5A2B]">
                {toPersianDigits(completedCount)} از{" "}
                {toPersianDigits(totalCount)} مورد (
                {toPersianDigits(progressPct)}٪)
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F1EFEA]">
              <div
                className="h-full bg-[#9A6B3F] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageStaff && (
            <select
              value={selectedStaffFilter}
              onChange={(e) => onSelectedStaffFilterChange(e.target.value)}
              aria-label="فیلتر کارمند"
              className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413]"
            >
              <option value="all">همه کارکنان</option>
              {staffList.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          )}

          <div className="inline-flex overflow-hidden rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] p-0.5">
            {(["all", "open", "completed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-[#FFFFFF] text-[#141413] shadow-xs"
                    : "text-[#5C5852] hover:text-[#141413]"
                }`}
              >
                {st === "all"
                  ? "همه"
                  : st === "open"
                    ? "انجام‌نشده"
                    : "تکمیل‌شده"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Ledger */}
      <div className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]">
        {visibleTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#5C5852]">
            وظیفه‌ای مطابق فیلتر فعلی ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-[#E6E2D8]">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:px-5 ${
                  task.isCompleted ? "bg-[#EDF5F1]/35" : "hover:bg-[#FAF9F6]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    disabled={togglingId === task.id}
                    onClick={() => handleToggleTask(task)}
                    aria-pressed={task.isCompleted}
                    aria-label={`تغییر وضعیت انجام ${task.title}`}
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                      task.isCompleted
                        ? "border-[#2C5E4F] bg-[#2C5E4F] text-[#FAF9F6]"
                        : "border-[#CEC8BA] bg-[#FAF9F6] text-[#5C5852] hover:border-[#141413]"
                    }`}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          task.isCompleted
                            ? "text-[#5C5852] line-through"
                            : "text-[#141413]"
                        }`}
                      >
                        {task.title}
                      </span>

                      <span className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-medium text-[#3F3D39]">
                        {TASK_CATEGORY_LABELS[task.category]}
                      </span>

                      {task.priority === "high" && (
                        <span className="rounded-[2px] border border-[#F5C6C6] bg-[#FDF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#991B1B]">
                          {TASK_PRIORITY_LABELS.high}
                        </span>
                      )}

                      {canManageStaff && (
                        <span className="rounded-[2px] border border-[#E7D3B5] bg-[#FBF5EC] px-2 py-0.5 text-[11px] font-semibold text-[#8A5A2B]">
                          {task.staffFullName}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs leading-6 text-[#5C5852]">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5C5852]">
                      {task.dueLabel && (
                        <span className="inline-flex items-center gap-1">
                          <Clock
                            className="h-3 w-3 text-[#9A6B3F]"
                            aria-hidden="true"
                          />
                          <span>مهلت: {task.dueLabel}</span>
                        </span>
                      )}
                      {task.isCompleted && task.completedAt && (
                        <span className="font-semibold text-[#234E40]">
                          تکمیل‌شده توسط{" "}
                          <span dir="ltr" className="font-mono">
                            {task.completedByUsername}
                          </span>{" "}
                          در {formatFxTimestamp(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={togglingId === task.id}
                    onClick={() => handleToggleTask(task)}
                    className={`rounded-[3px] px-3.5 py-2 text-xs font-semibold transition-colors ${
                      task.isCompleted
                        ? "border border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:text-[#141413]"
                        : "bg-[#141413] text-[#FAF9F6] hover:bg-[#262523]"
                    }`}
                  >
                    {task.isCompleted ? "بازگردانی به انجام‌نشده" : "تیک انجام شد"}
                  </button>

                  {canManageStaff && (
                    <button
                      type="button"
                      disabled={deletingId === task.id}
                      onClick={() => handleDeleteTask(task)}
                      aria-label={`حذف وظیفه ${task.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:border-red-300 hover:text-[#991B1B]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

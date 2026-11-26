"use client";

import { useState } from "react";
import {
  CheckSquare,
  KeyRound,
  ListChecks,
  Plus,
  Save,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { toPersianDigits } from "@/lib/persian-seo";
import {
  PERMISSION_CATALOG,
  PERMISSION_PRESETS,
  ROLE_LABELS,
  type PermissionKey,
  type StaffRole,
} from "@/lib/permissions";

export interface StaffMemberItem {
  id: number;
  username: string;
  fullName: string;
  jobTitle: string;
  role: StaffRole;
  permissions: PermissionKey[];
  isActive: boolean;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

interface StaffManagementPanelProps {
  staffList: StaffMemberItem[];
  currentUserId: "root" | number;
  onRefreshStaff: () => Promise<void>;
  onJumpToTasksForStaff: (staffId: number) => void;
  onFeedback: (feedback: { type: "success" | "error"; text: string }) => void;
}

export function StaffManagementPanel({
  staffList,
  currentUserId,
  onRefreshStaff,
  onJumpToTasksForStaff,
  onFeedback,
}: StaffManagementPanelProps) {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([
    "inquiries:view",
  ]);
  const [creating, setCreating] = useState(false);

  const [draftEdits, setDraftEdits] = useState<
    Record<
      number,
      {
        fullName: string;
        jobTitle: string;
        role: StaffRole;
        permissions: PermissionKey[];
        isActive: boolean;
        newPassword: string;
      }
    >
  >({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getDraft = (emp: StaffMemberItem) => {
    return (
      draftEdits[emp.id] ?? {
        fullName: emp.fullName,
        jobTitle: emp.jobTitle,
        role: emp.role,
        permissions: emp.permissions,
        isActive: emp.isActive,
        newPassword: "",
      }
    );
  };

  const updateDraft = (
    emp: StaffMemberItem,
    patch: Partial<{
      fullName: string;
      jobTitle: string;
      role: StaffRole;
      permissions: PermissionKey[];
      isActive: boolean;
      newPassword: string;
    }>
  ) => {
    const current = getDraft(emp);
    setDraftEdits((prev) => ({
      ...prev,
      [emp.id]: { ...current, ...patch },
    }));
  };

  const toggleCreatePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleDraftPermission = (emp: StaffMemberItem, key: PermissionKey) => {
    const draft = getDraft(emp);
    const next = draft.permissions.includes(key)
      ? draft.permissions.filter((p) => p !== key)
      : [...draft.permissions, key];
    updateDraft(emp, { permissions: next });
  };

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/staff/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fullName,
          jobTitle,
          password,
          role,
          permissions: selectedPermissions,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        staff?: StaffMemberItem;
      };
      if (!res.ok || !data.ok || !data.staff) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در ایجاد حساب کارمند.",
        });
        return;
      }

      setFullName("");
      setJobTitle("");
      setUsername("");
      setPassword("");
      setRole("staff");
      setSelectedPermissions(["inquiries:view"]);
      await onRefreshStaff();
      onFeedback({
        type: "success",
        text: `حساب کارمند «${data.staff.fullName}» با دسترسی‌های انتخاب‌شده ایجاد شد.`,
      });
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setCreating(false);
    }
  };

  const handleSaveStaff = async (emp: StaffMemberItem) => {
    const draft = getDraft(emp);
    setSavingId(emp.id);
    try {
      const payload: Record<string, unknown> = {
        fullName: draft.fullName,
        jobTitle: draft.jobTitle,
        role: draft.role,
        permissions: draft.permissions,
        isActive: draft.isActive,
      };
      if (draft.newPassword.trim()) {
        payload.password = draft.newPassword;
      }

      const res = await fetch(`/api/admin/staff/${emp.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        staff?: StaffMemberItem;
      };
      if (!res.ok || !data.ok || !data.staff) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در ذخیره دسترسی‌های کارمند.",
        });
        return;
      }

      setDraftEdits((prev) => {
        const next = { ...prev };
        delete next[emp.id];
        return next;
      });
      await onRefreshStaff();
      onFeedback({
        type: "success",
        text: `دسترسی‌ها و مشخصات «${data.staff.fullName}» بروزرسانی شد و بلافاصله اعمال گردید.`,
      });
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteStaff = async (emp: StaffMemberItem) => {
    setDeletingId(emp.id);
    try {
      const res = await fetch(`/api/admin/staff/${emp.id}/`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        onFeedback({
          type: "error",
          text: data.error || "خطا در حذف کارمند.",
        });
        return;
      }
      await onRefreshStaff();
      onFeedback({
        type: "success",
        text: `حساب کاربری «${emp.fullName}» و وظایف مرتبط حذف شد.`,
      });
    } catch {
      onFeedback({ type: "error", text: "خطا در ارتباط با سرور." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Staff Form */}
      <form
        onSubmit={handleCreateStaff}
        className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <UserPlus className="h-4 w-4 text-[#9A6B3F]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-sm font-bold text-[#141413] sm:text-base">
                افزودن کارمند جدید و تعیین دسترسی‌ها
              </h2>
              <p className="text-xs text-[#5C5852]">
                دقیقاً مشخص کنید هر کارمند به کدام بخش‌های میزکار دسترسی داشته
                باشد.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-semibold text-[#141413]">
                نام و نام خانوادگی *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثلاً: رضا محمدی"
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141413]">
                سمت شغلی *
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="مثلاً: کارشناس فروش"
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141413]">
                نام کاربری (انگلیسی) *
              </label>
              <input
                type="text"
                dir="ltr"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="reza_sales"
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end font-mono text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141413]">
                رمز عبور (حداقل ۸ کاراکتر) *
              </label>
              <input
                type="password"
                dir="ltr"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141413]">
                نقش سازمانی
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
              >
                <option value="staff">کارمند</option>
                <option value="manager">مدیر</option>
              </select>
            </div>
          </div>

          {/* Preset Templates */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#141413]">
                <CheckSquare
                  className="h-4 w-4 text-[#9A6B3F]"
                  aria-hidden="true"
                />
                <span>انتخاب دسترسی‌های کارمند (تیک مجوزها):</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {PERMISSION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setRole(preset.role);
                      setSelectedPermissions([...preset.permissions]);
                    }}
                    className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 py-1 text-[11px] font-semibold text-[#141413] transition-colors hover:border-[#141413]"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedPermissions([])}
                  className="rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-medium text-[#5C5852] hover:text-[#991B1B]"
                >
                  پاک کردن همه
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {PERMISSION_CATALOG.map((perm) => {
                const checked = selectedPermissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-[3px] border p-3 text-xs transition-colors ${
                      checked
                        ? "border-[#9A6B3F] bg-[#FBF8F3] text-[#141413]"
                        : "border-[#E6E2D8] bg-[#FAF9F6] text-[#5C5852] hover:text-[#141413]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCreatePermission(perm.key)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CEC8BA] accent-[#9A6B3F]"
                    />
                    <div>
                      <p className="font-bold text-[#141413]">{perm.label}</p>
                      <p className="mt-0.5 text-[11px] leading-5 text-[#5C5852]">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-5 inline-flex items-center gap-2 rounded-[3px] bg-[#141413] px-5 py-2.5 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#262523] disabled:opacity-60 sm:text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{creating ? "در حال ایجاد..." : "ایجاد حساب کارمند"}</span>
          </button>
        </div>
      </form>

      {/* Staff List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-[#141413] sm:text-base">
            فهرست کارکنان و مدیریت مجوزها ({toPersianDigits(staffList.length)}{" "}
            نفر)
          </h2>
        </div>

        {staffList.length === 0 ? (
          <div className="rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] p-8 text-center text-sm text-[#5C5852]">
            هنوز کارمندی ثبت نشده است. از فرم بالا اولین کارمند را اضافه کنید.
          </div>
        ) : (
          staffList.map((emp) => {
            const draft = getDraft(emp);
            const isSelf = currentUserId === emp.id;
            const progressPct =
              emp.totalTasks > 0
                ? Math.round((emp.completedTasks / emp.totalTasks) * 100)
                : 0;

            return (
              <div
                key={emp.id}
                className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6E2D8] pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-[#141413]">
                        {emp.fullName}
                      </h3>
                      <span
                        dir="ltr"
                        className="rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 font-mono text-xs font-medium text-[#141413]"
                      >
                        @{emp.username}
                      </span>
                      <span className="rounded-[2px] border border-[#E7D3B5] bg-[#FBF5EC] px-2 py-0.5 text-xs font-semibold text-[#8A5A2B]">
                        {ROLE_LABELS[emp.role]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 text-xs font-semibold ${
                          draft.isActive
                            ? "border-[#C5DDD3] bg-[#EDF5F1] text-[#234E40]"
                            : "border-[#F5C6C6] bg-[#FDF2F2] text-[#991B1B]"
                        }`}
                      >
                        {draft.isActive ? (
                          <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{draft.isActive ? "فعال" : "غیرفعال"}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#5C5852]">{emp.jobTitle}</p>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="min-w-[160px] rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#5C5852]">پیشرفت وظایف:</span>
                        <span className="tabular-nums font-bold text-[#141413]">
                          {toPersianDigits(emp.completedTasks)} از{" "}
                          {toPersianDigits(emp.totalTasks)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E2D8]">
                        <div
                          className="h-full bg-[#9A6B3F] transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onJumpToTasksForStaff(emp.id)}
                      className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#141413] hover:border-[#141413]"
                    >
                      <ListChecks
                        className="h-4 w-4 text-[#9A6B3F]"
                        aria-hidden="true"
                      />
                      <span>افزودن وظیفه</span>
                    </button>

                    <button
                      type="button"
                      disabled={savingId === emp.id}
                      onClick={() => handleSaveStaff(emp)}
                      className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#141413] px-4 py-2 text-xs font-semibold text-[#FAF9F6] hover:bg-[#262523] disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {savingId === emp.id ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </span>
                    </button>

                    {!isSelf && (
                      <button
                        type="button"
                        disabled={deletingId === emp.id}
                        onClick={() => handleDeleteStaff(emp)}
                        aria-label={`حذف ${emp.fullName}`}
                        className="inline-flex items-center gap-1 rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#5C5852] hover:border-red-300 hover:text-[#991B1B] disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable Metadata & Password Reset */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      value={draft.fullName}
                      onChange={(e) =>
                        updateDraft(emp, { fullName: e.target.value })
                      }
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      سمت شغلی
                    </label>
                    <input
                      type="text"
                      value={draft.jobTitle}
                      onChange={(e) =>
                        updateDraft(emp, { jobTitle: e.target.value })
                      }
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5852]">
                      نقش
                    </label>
                    <select
                      value={draft.role}
                      onChange={(e) =>
                        updateDraft(emp, { role: e.target.value as StaffRole })
                      }
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    >
                      <option value="staff">کارمند</option>
                      <option value="manager">مدیر</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-[#5C5852]">
                      <KeyRound className="h-3 w-3" aria-hidden="true" />
                      <span>تغییر رمز عبور (اختیاری)</span>
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={draft.newPassword}
                      onChange={(e) =>
                        updateDraft(emp, { newPassword: e.target.value })
                      }
                      placeholder="خالی = بدون تغییر"
                      className="mt-1 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-end text-xs text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex w-full cursor-pointer items-center justify-between rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-[#141413]">
                      <span>وضعیت حساب فعال</span>
                      <input
                        type="checkbox"
                        disabled={isSelf}
                        checked={draft.isActive}
                        onChange={(e) =>
                          updateDraft(emp, { isActive: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-[#CEC8BA] accent-[#9A6B3F]"
                      />
                    </label>
                  </div>
                </div>

                {/* Live Editable Permission Checkboxes */}
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#141413]">
                    <Shield
                      className="h-3.5 w-3.5 text-[#9A6B3F]"
                      aria-hidden="true"
                    />
                    <span>دسترسی‌های فعال این کارمند:</span>
                  </p>
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {PERMISSION_CATALOG.map((perm) => {
                      const checked = draft.permissions.includes(perm.key);
                      const disabledSelfLock =
                        isSelf && perm.key === "staff:manage";
                      return (
                        <label
                          key={perm.key}
                          className={`flex cursor-pointer items-center gap-2 rounded-[3px] border px-3 py-2 text-xs transition-colors ${
                            checked
                              ? "border-[#9A6B3F] bg-[#FBF8F3] font-semibold text-[#141413]"
                              : "border-[#E6E2D8] bg-[#FAF9F6] text-[#5C5852]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={disabledSelfLock}
                            checked={checked}
                            onChange={() => toggleDraftPermission(emp, perm.key)}
                            className="h-4 w-4 shrink-0 rounded border-[#CEC8BA] accent-[#9A6B3F]"
                          />
                          <span>{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

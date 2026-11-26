export const ALL_PERMISSION_KEYS = [
  "inquiries:view",
  "inquiries:edit",
  "uploads:download",
  "pricing:view",
  "pricing:edit",
  "warranties:manage",
  "staff:manage",
  "audit:view",
] as const;

export type PermissionKey = (typeof ALL_PERMISSION_KEYS)[number];
export type StaffRole = "manager" | "staff";
export type TaskCategory =
  | "daily"
  | "sales"
  | "production"
  | "warranty"
  | "general";
export type TaskPriority = "normal" | "high";

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
  managerOnly?: boolean;
}

export const PERMISSION_CATALOG: readonly PermissionMeta[] = [
  {
    key: "inquiries:view",
    label: "مشاهده استعلام‌ها و مشخصات مشتریان",
    description: "دسترسی به فهرست درخواست‌های قیمت، جزئیات ابعاد و اطلاعات تماس مشتریان",
  },
  {
    key: "inquiries:edit",
    label: "تغییر وضعیت سفارش‌ها و ثبت یادداشت کارشناسی",
    description: "بروزرسانی وضعیت پیگیری پرونده‌ها و ثبت یادداشت داخلی کارشناس",
  },
  {
    key: "uploads:download",
    label: "دانلود نقشه‌ها و فایل‌های پیوست مشتریان",
    description: "دریافت فایل‌های PDF، تصویر و نقشه DWG ارسال‌شده در استعلام‌ها",
  },
  {
    key: "pricing:view",
    label: "مشاهده تعرفه‌ها، فرمول قیمت و نرخ دلار",
    description: "مشاهده نرخ فعال ارز، تاریخچه نرخ‌ها و فرمول قیمت‌گذاری محصولات",
  },
  {
    key: "pricing:edit",
    label: "ویرایش تعرفه، فرمول کالاها و بروزرسانی نرخ دلار",
    description: "تغییر ضرایب فرمول محصولات، تغییر حالت دستی/خودکار و همگام‌سازی دلار",
  },
  {
    key: "warranties:manage",
    label: "صدور ضمانت‌نامه و پیگیری درخواست‌های رگلاژ",
    description: "ثبت کارت ضمانت‌نامه جدید و مدیریت درخواست‌های خدمات پس از فروش",
  },
  {
    key: "staff:manage",
    label: "مدیریت کارکنان، تعیین دسترسی‌ها و تعریف شرح وظایف",
    description: "ایجاد حساب کارمند، تغییر سطح دسترسی و تعریف چک‌لیست وظایف (اختصاصی مدیر)",
    managerOnly: true,
  },
  {
    key: "audit:view",
    label: "مشاهده گزارش وقایع و تاریخچه عملکرد کارکنان",
    description: "بررسی وقایع ثبت‌شده، تغییرات قیمت و سوابق ورود و خروج (اختصاصی مدیر)",
    managerOnly: true,
  },
];

export const PERMISSION_LABELS: Record<PermissionKey, string> =
  Object.fromEntries(
    PERMISSION_CATALOG.map((item) => [item.key, item.label])
  ) as Record<PermissionKey, string>;

export const PERMISSION_PRESETS: readonly {
  id: string;
  label: string;
  role: StaffRole;
  permissions: readonly PermissionKey[];
}[] = [
  {
    id: "sales",
    label: "فروشنده / کارشناس فروش",
    role: "staff",
    permissions: [
      "inquiries:view",
      "inquiries:edit",
      "uploads:download",
      "pricing:view",
    ],
  },
  {
    id: "technical",
    label: "کارشناس فنی و تولید",
    role: "staff",
    permissions: [
      "inquiries:view",
      "uploads:download",
      "pricing:view",
      "warranties:manage",
    ],
  },
  {
    id: "warranty",
    label: "پشتیبانی و رگلاژ",
    role: "staff",
    permissions: ["inquiries:view", "warranties:manage"],
  },
  {
    id: "all",
    label: "انتخاب همه (مدیر)",
    role: "manager",
    permissions: ALL_PERMISSION_KEYS,
  },
];

export const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "مدیر",
  staff: "کارمند",
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  daily: "وظیفه روزانه",
  sales: "فروش و استعلام",
  production: "تولید و اندازه‌گیری",
  warranty: "گارانتی و رگلاژ",
  general: "عمومی",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  normal: "عادی",
  high: "فوری / اولویت بالا",
};

export function isValidPermissionKey(value: unknown): value is PermissionKey {
  return (
    typeof value === "string" &&
    (ALL_PERMISSION_KEYS as readonly string[]).includes(value)
  );
}

export function sanitizePermissions(raw: unknown): PermissionKey[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<PermissionKey>();
  for (const item of raw) {
    if (isValidPermissionKey(item)) {
      seen.add(item);
    }
  }
  return Array.from(seen);
}

export function parsePermissionsJson(raw: string | null | undefined): PermissionKey[] {
  if (!raw) return [];
  try {
    return sanitizePermissions(JSON.parse(raw));
  } catch {
    return [];
  }
}

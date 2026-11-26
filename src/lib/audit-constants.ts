export const AUDIT_ACTIONS = [
  "auth.login",
  "auth.logout",
  "inquiry.update",
  "upload.download",
  "pricing.update",
  "fx.update",
  "fx.sync",
  "warranty.create",
  "warranty_service.update",
  "staff.create",
  "staff.update",
  "staff.delete",
  "task.create",
  "task.update",
  "task.toggle",
  "task.delete",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
  "auth",
  "inquiry",
  "upload",
  "pricing",
  "fx",
  "warranty",
  "warranty_service",
  "staff",
  "task",
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  "auth.login": "ورود به پنل",
  "auth.logout": "خروج از پنل",
  "inquiry.update": "بروزرسانی استعلام",
  "upload.download": "دانلود فایل پیوست",
  "pricing.update": "ویرایش تعرفه و فرمول",
  "fx.update": "تغییر تنظیمات نرخ دلار",
  "fx.sync": "همگام‌سازی نرخ دلار",
  "warranty.create": "صدور ضمانت‌نامه",
  "warranty_service.update": "تغییر وضعیت رگلاژ",
  "staff.create": "ایجاد کارمند",
  "staff.update": "ویرایش کارمند و دسترسی",
  "staff.delete": "حذف کارمند",
  "task.create": "تعریف وظیفه",
  "task.update": "ویرایش وظیفه",
  "task.toggle": "تیک انجام وظیفه",
  "task.delete": "حذف وظیفه",
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntityType, string> = {
  auth: "ورود و خروج",
  inquiry: "استعلام‌ها",
  upload: "فایل‌های پیوست",
  pricing: "تعرفه و فرمول",
  fx: "نرخ دلار",
  warranty: "ضمانت‌نامه",
  warranty_service: "خدمات رگلاژ",
  staff: "کارکنان",
  task: "شرح وظایف",
};

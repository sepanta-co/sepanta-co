"use client";

import { Paperclip, X } from "lucide-react";
import { toPersianDigits } from "@/lib/persian-seo";

const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".dwg"]);
const MAX_CLIENT_BYTES = 10 * 1024 * 1024; // 10 MB

export interface DrawingAttachmentInputProps {
  id: string;
  file: File | null;
  error: string | null;
  onFileChange: (file: File | null, error: string | null) => void;
}

export function DrawingAttachmentInput({
  id,
  file,
  error,
  onFileChange,
}: DrawingAttachmentInputProps) {
  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) {
      onFileChange(null, null);
      return;
    }

    const lower = selected.name.toLowerCase();
    const dotIndex = lower.lastIndexOf(".");
    const ext = dotIndex >= 0 ? lower.slice(dotIndex) : "";

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      event.target.value = "";
      onFileChange(
        null,
        "فرمت مجاز نیست. تنها فایل‌های PDF، JPG، PNG و DWG قابل پیوست هستند."
      );
      return;
    }

    if (selected.size === 0) {
      event.target.value = "";
      onFileChange(null, "فایل انتخاب‌شده خالی است.");
      return;
    }

    if (selected.size > MAX_CLIENT_BYTES) {
      event.target.value = "";
      onFileChange(
        null,
        "حجم فایل انتخاب‌شده بیشتر از ۱۰ مگابایت است."
      );
      return;
    }

    onFileChange(selected, null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-semibold text-ink">
        پیوست نقشه یا عکس دهانه (PDF, JPG, PNG, DWG — حداکثر{" "}
        {toPersianDigits(10)} مگابایت)
      </label>

      {file ? (
        <div className="flex items-center justify-between gap-3 border border-brand/30 bg-surface-panel px-3.5 py-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-2 text-ink">
            <Paperclip className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="truncate font-semibold">{file.name}</span>
            <span className="tabular-nums shrink-0 text-ink-muted">
              ({toPersianDigits((file.size / (1024 * 1024)).toFixed(2))} مگابایت)
            </span>
          </div>

          <button
            type="button"
            onClick={() => onFileChange(null, null)}
            aria-label="حذف فایل پیوست"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border border-border bg-surface text-ink-muted hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.dwg"
          onChange={handleSelect}
          className="block w-full cursor-pointer rounded-[2px] border border-dashed border-border bg-surface px-3.5 py-2.5 text-xs text-ink-muted file:me-3 file:cursor-pointer file:rounded-[2px] file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:border-brand"
        />
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

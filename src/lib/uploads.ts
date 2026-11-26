import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export type DetectedDrawingType = "PDF" | "JPEG" | "PNG" | "DWG";

export interface SavedDrawingResult {
  storedFilename: string;
  originalName: string;
  sizeBytes: number;
  detectedType: DetectedDrawingType;
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export function getUploadsDir(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

function detectMagicType(buffer: Buffer): {
  ext: string;
  detectedType: DetectedDrawingType;
} | null {
  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { ext: ".pdf", detectedType: "PDF" };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { ext: ".jpg", detectedType: "JPEG" };
  }

  // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: ".png", detectedType: "PNG" };
  }

  // AutoCAD DWG: ASCII AC10 (0x41 0x43 0x31 0x30)
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x41 &&
    buffer[1] === 0x43 &&
    buffer[2] === 0x31 &&
    buffer[3] === 0x30
  ) {
    return { ext: ".dwg", detectedType: "DWG" };
  }

  return null;
}

function sanitizeDisplayFilename(rawName: string, fallbackExt: string): string {
  const base = path.basename(rawName || "").replace(/[\u0000-\u001F\u007F/\\]/g, "");
  const trimmed = base.trim().slice(0, 120);
  return trimmed || `attachment${fallbackExt}`;
}

export async function saveValidatedDrawing(
  file: File
): Promise<SavedDrawingResult> {
  if (file.size === 0) {
    throw new UploadValidationError("فایل انتخاب‌شده خالی است.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      "حجم فایل پیوست نباید بیشتر از ۱۰ مگابایت باشد."
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new UploadValidationError("محتوای فایل پیوست خالی است.");
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      "حجم فایل پیوست نباید بیشتر از ۱۰ مگابایت باشد."
    );
  }

  const detected = detectMagicType(buffer);
  if (!detected) {
    throw new UploadValidationError(
      "امضای باینری فایل معتبر نیست. تنها فایل‌های واقعی PDF، JPG، PNG و AutoCAD DWG پذیرفته می‌شوند."
    );
  }

  const uploadsDir = getUploadsDir();
  fs.mkdirSync(uploadsDir, { recursive: true });

  const storedFilename = `${crypto.randomUUID()}${detected.ext}`;
  const destinationPath = path.join(
    /*turbopackIgnore: true*/ uploadsDir,
    storedFilename
  );
  fs.writeFileSync(destinationPath, buffer, { mode: 0o640 });

  return {
    storedFilename,
    originalName: sanitizeDisplayFilename(file.name, detected.ext),
    sizeBytes: buffer.length,
    detectedType: detected.detectedType,
  };
}

export function deleteUploadedFile(storedFilename: string | null | undefined): void {
  if (!storedFilename) return;
  try {
    const safeName = path.basename(storedFilename);
    const fullPath = path.join(/*turbopackIgnore: true*/ getUploadsDir(), safeName);
    if (fs.existsSync(/*turbopackIgnore: true*/ fullPath)) {
      fs.unlinkSync(/*turbopackIgnore: true*/ fullPath);
    }
  } catch {
    // Best-effort cleanup
  }
}

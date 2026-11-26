import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";
import { getDb } from "@/lib/db";
import { getUploadsDir } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const SAFE_FILENAME_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png|dwg)$/i;

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  dwg: "application/octet-stream",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const auth = await requireAdminAccess("uploads:download");
  if (!auth.ok) return auth.response;

  const { filename } = await params;
  if (!SAFE_FILENAME_REGEX.test(filename)) {
    return NextResponse.json(
      { ok: false, error: "نام فایل معتبر نیست." },
      { status: 400 }
    );
  }

  const uploadsDir = getUploadsDir();
  const fullPath = path.join(/*turbopackIgnore: true*/ uploadsDir, filename);

  if (!fs.existsSync(/*turbopackIgnore: true*/ fullPath)) {
    return NextResponse.json(
      { ok: false, error: "فایل مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ fullPath);

  const linkedInquiry = getDb()
    .prepare(
      "SELECT tracking_code, attachment_original_name FROM inquiries WHERE attachment_path = ? LIMIT 1"
    )
    .get(filename) as
    | { tracking_code: string; attachment_original_name: string | null }
    | undefined;

  recordAuditEvent({
    session: auth.session,
    action: "upload.download",
    entityType: "upload",
    entityId: linkedInquiry?.tracking_code || filename,
    summary: linkedInquiry
      ? `دانلود فایل پیوست استعلام ${linkedInquiry.tracking_code}`
      : `دانلود فایل پیوست ${filename}`,
    details: {
      filename,
      trackingCode: linkedInquiry?.tracking_code ?? null,
      originalName: linkedInquiry?.attachment_original_name ?? null,
    },
    request,
  });

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

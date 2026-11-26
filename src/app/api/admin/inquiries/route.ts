import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface InquiryAdminRow {
  id: number;
  tracking_code: string;
  customer_name: string;
  phone: string;
  city: string;
  project_type: string;
  items_json: string;
  estimated_total_irr: number;
  notes: string | null;
  attachment_path: string | null;
  attachment_original_name: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "دسترسی غیرمجاز" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status")?.trim() || "";
  const query = url.searchParams.get("q")?.trim() || "";

  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (statusFilter && statusFilter !== "all") {
    conditions.push("status = @status");
    params.status = statusFilter;
  }

  if (query) {
    conditions.push(
      "(tracking_code LIKE @q OR customer_name LIKE @q OR phone LIKE @q OR city LIKE @q)"
    );
    params.q = `%${query}%`;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM inquiries ${whereClause} ORDER BY created_at DESC, id DESC`
    )
    .all(params) as InquiryAdminRow[];

  const kpiRow = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as newCount,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN estimated_total_irr ELSE 0 END), 0) as pipelineIrr
       FROM inquiries`
    )
    .get() as {
    total: number;
    newCount: number | null;
    pipelineIrr: number | null;
  };

  const inquiries = rows.map((row) => {
    let items: unknown[] = [];
    try {
      const parsed = JSON.parse(row.items_json);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }

    return {
      id: row.id,
      trackingCode: row.tracking_code,
      customerName: row.customer_name,
      phone: row.phone,
      city: row.city,
      projectType: row.project_type,
      items,
      estimatedTotalIrr: row.estimated_total_irr,
      notes: row.notes,
      attachmentPath: row.attachment_path,
      attachmentOriginalName: row.attachment_original_name,
      status: row.status,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return NextResponse.json(
    {
      ok: true,
      kpis: {
        total: kpiRow.total ?? 0,
        newCount: kpiRow.newCount ?? 0,
        pipelineIrr: kpiRow.pipelineIrr ?? 0,
      },
      inquiries,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

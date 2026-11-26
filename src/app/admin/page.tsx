import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminSession, toPublicUserProfile } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "میزکار مدیریت کارخانه سپنتا",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();

  return (
    <AdminDashboard
      initialSession={
        session
          ? { authenticated: true, user: toPublicUserProfile(session) }
          : { authenticated: false }
      }
    />
  );
}

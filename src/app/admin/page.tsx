import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminSession, toPublicUserProfile } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل مدیریت کارخانه",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();

  return (
    <section className="bg-surface-subtle py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdminDashboard
          initialSession={
            session
              ? { authenticated: true, user: toPublicUserProfile(session) }
              : { authenticated: false }
          }
        />
      </div>
    </section>
  );
}

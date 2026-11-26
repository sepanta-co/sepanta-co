import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-start">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">
          گروه صنعتی سپنتا — زیرساخت فاز ۱.۱ آماده است
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-600">
          خروجی استاتیک بدون وابستگی خارجی و سرور Nginx Alpine با موفقیت پیکربندی شده است.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <Link
            href="/non-existent-test/"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            بررسی صفحه خطای ۴۰۴
          </Link>
        </div>
      </div>
    </main>
  );
}

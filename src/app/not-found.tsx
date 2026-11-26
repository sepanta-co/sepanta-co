import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-start">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
        <p className="text-sm font-semibold text-zinc-500">خطای ۴۰۴</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">
          صفحه مورد نظر یافت نشد
        </h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          نشانی وارد شده در وب‌سایت گروه صنعتی سپنتا وجود ندارد یا منتقل شده است.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  );
}

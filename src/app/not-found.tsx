import React from "react";
import type { Metadata } from "next";
import { NotFoundClient } from "@/components/layout/NotFoundClient";

export const metadata: Metadata = {
  title: "صفحه مورد نظر یافت نشد (خطای ۴۰۴) | گروه صنعتی سپنتا",
  description: "صفحه‌ای که به دنبال آن بودید در وب‌سایت گروه صنعتی سپنتا پیدا نشد.",
};

export default function NotFound() {
  return <NotFoundClient />;
}

"use client";

import { Spin } from "antd";
import ExamHeader from "./ExamHeader";

type Props = { variant?: "instructions" | "plain" };

export default function ExamLoadingShell({ variant = "plain" }: Props) {
  const spin = <Spin size="large" description="Loading…" />;

  if (variant === "instructions") {
    return (
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#f0f2f5]">
        <ExamHeader compact />
        <main className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 sm:px-5 sm:pb-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="flex min-h-[40dvh] flex-1 items-center justify-center p-6">
              {spin}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f0f2f5]">
      <ExamHeader />
      <div className="flex min-h-[50dvh] flex-1 items-center justify-center p-8">
        {spin}
      </div>
    </div>
  );
}

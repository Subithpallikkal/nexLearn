"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setSubmitResult } from "@/app/store/examSlice";
import { authService } from "@/lib/auth";
import { pad3 } from "@/lib/examFormat";
import {
  getExamSubmissionBundle,
  type ExamMetaSnapshot,
} from "@/lib/examResultStorage";
import ExamHeader from "../components/ExamHeader";
import { MessageCircle, CheckSquare, SquareX, ClipboardList } from "lucide-react";

type StatKey = "total" | "correct" | "wrong" | "skipped";

const STAT_ROWS: {
  key: StatKey;
  label: string;
  Icon: typeof MessageCircle;
  iconBg: string;
}[] = [
  {
    key: "total",
    label: "Total Questions:",
    Icon: MessageCircle,
    iconBg: "bg-amber-400",
  },
  {
    key: "correct",
    label: "Correct Answers:",
    Icon: CheckSquare,
    iconBg: "bg-emerald-500",
  },
  {
    key: "wrong",
    label: "Incorrect Answers:",
    Icon: SquareX,
    iconBg: "bg-red-500",
  },
  {
    key: "skipped",
    label: "Not Attended Questions:",
    Icon: ClipboardList,
    iconBg: "bg-slate-500",
  },
];

export default function ExamResultPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lastSubmitResult = useAppSelector((s) => s.exam.lastSubmitResult);
  const meta = useAppSelector((s) => s.exam.meta);

  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState<ExamMetaSnapshot | null>(null);

  useEffect(() => {
    if (!authService.getAccessToken()) {
      router.replace("/create-account");
      return;
    }

    if (lastSubmitResult?.success) {
      setSnapshot((prev) => {
        if (prev) return prev;
        if (meta)
          return {
            total_marks: meta.total_marks,
            questions_count: meta.questions_count,
          };
        return getExamSubmissionBundle()?.meta ?? null;
      });
      setReady(true);
      return;
    }

    const bundle = getExamSubmissionBundle();
    if (bundle?.result.success) {
      dispatch(setSubmitResult(bundle.result));
      setSnapshot(bundle.meta);
      setReady(true);
      return;
    }

    router.replace("/exam/instructions");
  }, [dispatch, lastSubmitResult, meta, router]);

  if (!ready || !lastSubmitResult?.success) {
    return (
      <Spin
        spinning
        fullscreen
        size="large"
      />
    );
  }

  const r = lastSubmitResult;
  const totalQs = r.correct + r.wrong + r.not_attended;
  const totalMarks = snapshot?.total_marks ?? meta?.total_marks ?? totalQs;

  const values: Record<StatKey, number> = {
    total: totalQs,
    correct: r.correct,
    wrong: r.wrong,
    skipped: r.not_attended,
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#f8fdff]">
      <ExamHeader />

      <main className="mx-auto flex h-[calc(100dvh-4rem)] max-w-md items-center justify-center px-3 py-3 sm:px-4 sm:py-4">
        <div className="w-full max-w-90 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_36px_-16px_rgba(15,23,42,0.35)]">
          <div className="bg-linear-to-br from-[#0b6381] via-[#165f77] to-[#0e3c56] px-6 py-5 text-center">
            <p className="text-[15px] font-medium text-white/90">Marks Obtained:</p>
            <p className="mt-1 font-sans text-5xl font-bold tabular-nums leading-tight text-white">
              {r.score}
              <span className="text-white/80"> / {totalMarks}</span>
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-4">
            {STAT_ROWS.map(({ key, label, Icon, iconBg }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-white ${iconBg}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <span className="text-[17px] text-[#334155]">{label}</span>
                </div>
                <span className="text-[24px] font-semibold tabular-nums leading-none text-[#0f172a]">
                  {pad3(values[key])}
                </span>
              </div>
            ))}
          </div>

          {r.submitted_at && (
            <p className="px-6 pb-2 text-center text-xs text-slate-400">
              Submitted {new Date(r.submitted_at).toLocaleString()}
            </p>
          )}

          <div className="p-4 pt-2">
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="w-full rounded-md bg-[#1e2d3b] py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1a2838]"
            >
              Done
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

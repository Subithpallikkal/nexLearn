"use client";

import { useEffect, useState } from "react";
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
import ExamLoadingShell from "../components/ExamLoadingShell";
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
    return <ExamLoadingShell />;
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
    <div className="min-h-dvh bg-[#e8eef5]">
      <ExamHeader />

      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)]">
          <div className="bg-gradient-to-br from-[#1a4d5c] via-[#1e2d3b] to-[#152a33] px-6 py-8 text-center sm:px-8 sm:py-10">
            <p className="text-sm font-medium text-white/90">Marks Obtained:</p>
            <p className="mt-2 font-sans text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {r.score}
              <span className="text-white/70"> / {totalMarks}</span>
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-5 py-2 sm:px-6">
            {STAT_ROWS.map(({ key, label, Icon, iconBg }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="text-sm text-[#334155]">{label}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-[#0f172a]">
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

          <div className="p-5 pt-2">
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="w-full rounded-b-xl rounded-t-lg bg-[#1e2d3b] py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a2838]"
            >
              Done
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

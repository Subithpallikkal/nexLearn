"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { loadQuestionList, startExam } from "@/app/store/examSlice";
import { fetchQuestionList } from "@/lib/examApi";
import { displayTotalTime, parseInstructionLines } from "@/lib/examFormat";
import { requireExamAccess } from "@/lib/examGuards";
import ExamHeader from "../components/ExamHeader";
import ExamLoadingShell from "../components/ExamLoadingShell";
import Button from "@/app/components/ui/Button";

export default function ExamInstructionsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loaded, meta, questions } = useAppSelector((s) => s.exam);

  const [authChecked, setAuthChecked] = useState(false);
  const [fetching, setFetching] = useState(!loaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requireExamAccess(router)) return;
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    if (loaded && meta && questions.length > 0) {
      setFetching(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setFetching(true);
      setError(null);
      try {
        const data = await fetchQuestionList();
        if (cancelled) return;
        if (!data.success) {
          setError(data.message || "Could not load exam.");
          return;
        }
        dispatch(loadQuestionList(data));
      } catch {
        if (!cancelled) setError("Could not load exam. Try again.");
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authChecked, dispatch, loaded, meta, questions.length]);

  const startTest = () => {
    dispatch(startExam());
    router.push("/exam/test");
  };

  if (!authChecked) {
    return <ExamLoadingShell variant="instructions" />;
  }

  const instructionLines =
    meta?.instruction != null ? parseInstructionLines(meta.instruction) : [];

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#f0f2f5]">
      <ExamHeader compact />

      <main className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 sm:px-5 sm:pb-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          {fetching && (
            <div className="flex flex-1 items-center justify-center p-6">
              <p className="text-base text-slate-600">Loading exam…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-1 flex-col justify-center p-6">
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-700 sm:text-sm"
                role="alert"
              >
                {error}
              </div>
            </div>
          )}

          {!fetching && !error && meta && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
              <div className="mx-auto flex h-full min-h-0 w-full max-w-170.5 flex-col gap-4 sm:gap-5">
                <div className="flex shrink-0 flex-col items-center gap-2 sm:gap-3">
                  {/* SVG uses white fills — on bg-white it was invisible; brightness-0 renders a dark logo */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG brand asset */}
                  {/* <img
                    src="/namelogo.svg"
                    alt="NexLearn"
                    width={265}
                    height={84}
                    className="h-9 w-auto max-w-[min(320px,78vw)] object-contain brightness-0 sm:h-11"
                  /> */}
                  <h1 className="text-center font-sans text-lg font-semibold leading-tight text-[#0f172a] sm:text-lg">
                  {meta.title}
                  </h1>
                </div>

                <div
                  className="mx-auto grid w-full shrink-0 grid-cols-3 divide-x divide-white/25 overflow-hidden rounded-[7.91px] bg-[#1e2d3b] text-center text-white"
                  role="group"
                  aria-label="Exam summary"
                >
                  <div className="flex min-w-0 flex-col justify-center gap-0.5 px-2 py-2.5 sm:px-3 sm:py-3">
                    <p className="font-sans text-sm font-semibold leading-[1.44] tracking-normal text-white/90 sm:text-sm">
                      Total MCQ&apos;s:
                    </p>
                    <p className="font-sans text-xl font-semibold tabular-nums text-white sm:text-xl">
                      {meta.questions_count}
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-0.5 px-2 py-2.5 sm:px-3 sm:py-3">
                    <p className="font-sans text-sm font-semibold leading-[1.44] tracking-normal text-white/90 sm:text-sm">
                      Total marks:
                    </p>
                    <p className="font-sans text-xl font-semibold tabular-nums text-white sm:text-xl">
                      {meta.total_marks}
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-0.5 px-2 py-2.5 sm:px-3 sm:py-3">
                    <p className="font-sans text-sm font-semibold leading-[1.44] tracking-normal text-white/90 sm:text-sm">
                      Total time:
                    </p>
                    <p className="font-sans text-xl font-semibold tabular-nums text-white sm:text-xl">
                      {displayTotalTime(meta.total_time)}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col text-left">
                  <h2 className="mb-2 shrink-0 font-sans text-base font-semibold text-[#0f172a] sm:mb-3 sm:text-base">
                    Instructions:
                  </h2>
                  <ol className="scrollbar-none list-decimal pl-5 pr-1 text-sm leading-relaxed text-[#475569] marker:font-semibold sm:space-y-1.5 sm:pl-6 sm:text-[13px] sm:leading-relaxed">
                    {instructionLines.map((line, i) => (
                      <li key={i} className="pl-1">
                        {line.replace(/^\d+\.\s*/, "")}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex shrink-0 justify-center  sm:pt-4">
                  <Button
                    type="button"
                    onClick={startTest}
                    className="min-w-50 rounded-lg border-0 bg-[#1e2d3b]! px-8 py-2.5 text-base font-semibold text-white! shadow-none hover:bg-[#1a2838]! sm:py-3 sm:text-sm"
                    size="md"
                  >
                    Start Test
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

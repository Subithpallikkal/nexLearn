"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setAnswer,
  setCurrentIndex,
  setSubmitResult,
  tickTimer,
  toggleMarkForReview,
} from "@/app/store/examSlice";
import { submitAnswersApi } from "@/lib/examApi";
import { formatCountdown } from "@/lib/examFormat";
import { requireExamAccess } from "@/lib/examGuards";
import { saveExamSubmissionBundle } from "@/lib/examResultStorage";
import ExamHeader from "../components/ExamHeader";
import ExamLoadingShell from "../components/ExamLoadingShell";
import SubmitConfirmModal from "../components/SubmitConfirmModal";
import { clsx } from "clsx";
import { Clock } from "lucide-react";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

function resolveMediaUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = API_ORIGIN.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ExamTestPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    loaded,
    questions,
    meta,
    answers,
    markedForReview,
    visited,
    currentIndex,
    secondsRemaining,
    examStarted,
  } = useAppSelector((s) => s.exam);

  const [showParagraph, setShowParagraph] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const autoSubmitFired = useRef(false);

  const submitExam = useCallback(async () => {
    if (submitInFlight.current || !questions.length) return;
    submitInFlight.current = true;
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id] ?? null,
      }));
      const res = await submitAnswersApi(payload);
      dispatch(setSubmitResult(res));
      if (res.success) {
        saveExamSubmissionBundle(
          res,
          meta
            ? {
                total_marks: meta.total_marks,
                questions_count: meta.questions_count,
              }
            : null
        );
        setShowSubmitModal(false);
        router.push("/exam/result");
      } else {
        setShowSubmitModal(false);
        alert(res.message || "Submit failed");
      }
    } catch {
      setShowSubmitModal(false);
      alert("Submit failed. Try again.");
    } finally {
      setSubmitting(false);
      submitInFlight.current = false;
    }
  }, [answers, dispatch, meta, questions, router]);

  useEffect(() => {
    if (!requireExamAccess(router)) return;
    if (!loaded || !questions.length) {
      router.replace("/exam/instructions");
      return;
    }
    if (!examStarted || secondsRemaining === null) {
      router.replace("/exam/instructions");
    }
  }, [loaded, questions.length, router, examStarted, secondsRemaining]);

  useEffect(() => {
    if (!examStarted || secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      if (!autoSubmitFired.current) {
        autoSubmitFired.current = true;
        void submitExam();
      }
      return;
    }
    const id = window.setInterval(() => dispatch(tickTimer()), 1000);
    return () => window.clearInterval(id);
  }, [dispatch, examStarted, secondsRemaining, submitExam]);

  useEffect(() => {
    const q = questions[currentIndex];
    if (q) setShowParagraph(false);
  }, [currentIndex, questions]);

  useEffect(() => {
    if (!showSubmitModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSubmitModal]);

  if (
    !loaded ||
    !questions.length ||
    !meta ||
    !examStarted ||
    secondsRemaining === null
  ) {
    return <ExamLoadingShell />;
  }

  const q = questions[currentIndex];
  const comprehensionText =
    q.comprehension != null ? String(q.comprehension).trim() : "";
  const hasComprehensionPassage = comprehensionText.length > 0;
  const selected = answers[q.id] ?? null;
  const marked = !!markedForReview[q.id];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const gridCols = questions.length <= 50 ? 5 : 10;
  const qNumPad = String(questions.length).length;

  const questionsAnswered = questions.filter(
    (q) => answers[q.id] != null
  ).length;
  const markedForReviewCount = questions.filter(
    (q) => markedForReview[q.id]
  ).length;

  const cellClass = (index: number) => {
    const qq = questions[index];
    if (!qq) return "";
    const qid = qq.id;
    const ans = answers[qid];
    const vis = visited[qid];
    const mark = markedForReview[qid];
    const current = index === currentIndex;
    const answered = ans != null;

    let base =
      "flex h-8 w-full min-w-0 items-center justify-center rounded-md border text-xs font-medium tabular-nums shadow-sm sm:h-9 sm:text-sm";

    if (current) base += " z-[1] ring-2 ring-[#1e2d3b] ring-offset-2 ring-offset-white";

    if (answered) {
      if (mark) return clsx(base, "border-purple-600 bg-emerald-500 text-white");
      return clsx(base, "border-emerald-600 bg-emerald-500 text-white");
    }
    if (mark) {
      return clsx(base, "border-purple-500 bg-purple-600 text-white");
    }
    if (vis && !current) {
      return clsx(base, "border-red-300 bg-red-500 text-white");
    }
    return clsx(base, "border-slate-200 bg-white text-slate-700");
  };

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#f0f2f5] font-sans">
      <div className="shrink-0">
        <ExamHeader />
      </div>

      {/* <div className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-1.5 sm:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          MCQ
        </span>
      </div> */}

      <div className="mx-auto flex min-h-0 w-full max-w-350 flex-1 flex-col gap-3 px-3 py-2 sm:px-5 sm:py-3 lg:flex-row lg:items-stretch lg:gap-6 lg:px-8 lg:py-3">
        <section className="flex min-h-0 min-w-0 flex-[1.35] flex-col gap-2.5 lg:min-h-0 lg:flex-1">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="shrink-0 border-b border-slate-200/80 p-4 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                <h1 className="min-w-0 flex-1 font-sans text-base font-semibold leading-snug text-[#0f172a] sm:text-lg">
                  {meta.title}
                </h1>
                <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-[#475569] sm:px-3 sm:py-1.5 sm:text-base">
                  {String(currentIndex + 1).padStart(qNumPad, "0")}/
                  {questions.length}
                </span>
              </div>
            </div>

            <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
            {hasComprehensionPassage && (
              <button
                type="button"
                onClick={() => setShowParagraph((s) => !s)}
                aria-expanded={showParagraph}
                className="mb-4 inline-flex max-w-full items-center justify-start gap-2.5 self-start rounded border border-[#066a8a]/30 bg-[#087ea4] px-4 py-2 text-left text-sm font-semibold leading-snug text-white shadow-sm transition-colors hover:bg-[#066a8a] sm:py-2 sm:text-[14px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local SVG asset */}
                <img
                  src="/READ.svg"
                  alt=""
                  width={17}
                  height={14}
                  className="h-3.5 w-auto shrink-0 object-contain sm:h-4"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 leading-snug">
                  Read Comprehensive Paragraph
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element -- branded play icon */}
                <img
                  src="/paragraph-forward.png"
                  alt=""
                  width={26}
                  height={26}
                  className={clsx(
                    "h-4 w-4 shrink-0 object-contain transition-transform duration-200",
                    showParagraph && "rotate-90"
                  )}
                  aria-hidden
                />
              </button>
            )}

            {showParagraph && hasComprehensionPassage && (
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/90 p-4 text-sm leading-relaxed text-slate-700">
                {comprehensionText}
              </div>
            )}

            <p className="mb-4 text-[15px] leading-relaxed text-[#334155] sm:text-base">
              <span className="font-semibold text-[#0f172a]">
                {currentIndex + 1}.
              </span>{" "}
              {q.question_text}
            </p>

            {resolveMediaUrl(q.image) && (
              <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 sm:mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(q.image)!}
                  alt=""
                  className="max-h-[min(220px,28vh)] w-full object-contain sm:max-h-[min(280px,32vh)]"
                />
              </div>
            )}

            <p className="mb-3 text-sm font-semibold text-[#475569]">
              Choose the answer:
            </p>
            <ul className="space-y-2.5">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSel = selected === opt.id;
                return (
                  <li key={opt.id}>
                    <label
                      className={clsx(
                        "flex min-h-13 cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-all sm:min-h-14",
                        isSel
                          ? "border-[#1e2d3b] bg-slate-50 shadow-sm ring-1 ring-[#1e2d3b]/15"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      )}
                    >
                      <span className="min-w-0 flex-1 text-sm leading-snug text-[#334155]">
                        <span className="font-semibold text-[#0f172a]">
                          {letter}.
                        </span>{" "}
                        {opt.option_text}
                      </span>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={isSel}
                        onChange={() =>
                          dispatch(
                            setAnswer({
                              questionId: q.id,
                              optionId: opt.id,
                            })
                          )
                        }
                        className="h-4 w-4 shrink-0 accent-[#1e2d3b]"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            </div>
          </div>

          <div className="shrink-0 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <button
              type="button"
              onClick={() => dispatch(toggleMarkForReview(q.id))}
              className={clsx(
                "order-1 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors sm:order-0 sm:py-3.5",
                marked
                  ? "bg-purple-800 hover:bg-purple-900"
                  : "bg-purple-600 hover:bg-purple-700"
              )}
            >
              Mark for review
            </button>
            <button
              type="button"
              disabled={isFirst}
              onClick={() =>
                dispatch(setCurrentIndex(currentIndex - 1))
              }
              className="order-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:order-0 sm:py-3.5"
            >
              Previous
            </button>
            {isLast ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(true)}
                className="order-3 rounded-lg bg-[#1e2d3b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2838] disabled:opacity-60 sm:order-0 sm:py-3.5"
              >
                Submit exam
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  dispatch(setCurrentIndex(currentIndex + 1))
                }
                className="order-3 rounded-lg bg-[#1e2d3b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2838] sm:order-0 sm:py-3.5"
              >
                Next
              </button>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 w-full flex-1 flex-col lg:h-full lg:w-80 lg:flex-none xl:w-88">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="shrink-0 p-4 sm:p-5 sm:pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                <span className="text-sm font-semibold text-[#334155]">
                  Question No. Sheet:
                </span>
                <div className="flex flex-col items-end sm:shrink-0">
                  <span className="text-xs font-medium text-[#64748b]">
                    Remaining Time:
                  </span>
                  <span className="mt-1.5 inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-3.5 py-2 text-sm font-bold tabular-nums text-white shadow-inner">
                    <Clock className="h-4 w-4 shrink-0 opacity-90" />
                    {formatCountdown(Math.max(0, secondsRemaining))}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="scrollbar-minimal grid min-h-0 flex-1 gap-1.5 overflow-y-auto overscroll-contain px-4 pb-2 pr-3 sm:gap-2 sm:px-5"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridAutoRows: "min-content",
              }}
            >
              {questions.map((_, index) => (
                <button
                  key={questions[index].id}
                  type="button"
                  onClick={() => dispatch(setCurrentIndex(index))}
                  className={cellClass(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="shrink-0 border-t border-slate-100 p-4 pt-3 sm:p-5 sm:pt-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-[11px] leading-tight text-slate-600 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 shrink-0 rounded border border-emerald-600 bg-emerald-500" />
                Attended
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 shrink-0 rounded border border-red-300 bg-red-500" />
                Not Attended
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 shrink-0 rounded border border-purple-500 bg-purple-600" />
                Marked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="relative h-3 w-3 shrink-0 rounded border-2 border-purple-600 bg-emerald-500" />
                Answered + Marked
              </span>
            </div>
            </div>
          </div>
        </aside>
      </div>

      <SubmitConfirmModal
        open={showSubmitModal}
        onClose={() => !submitting && setShowSubmitModal(false)}
        onConfirm={() => void submitExam()}
        remainingTimeFormatted={formatCountdown(Math.max(0, secondsRemaining))}
        totalQuestions={questions.length}
        questionsAnswered={questionsAnswered}
        markedForReviewCount={markedForReviewCount}
        submitting={submitting}
      />
    </div>
  );
}

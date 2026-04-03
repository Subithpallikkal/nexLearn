"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setAnswer,
  setCurrentIndex,
  setSubmitResult,
  tickTimer,
  toggleMarkForReview,
  resetExam,
} from "@/app/store/examSlice";
import { resetAuth } from "@/app/store/authSlice";
import { submitAnswersApi } from "@/lib/examApi";
import { formatCountdown } from "@/lib/examFormat";
import { requireExamAccess } from "@/lib/examGuards";
import {
  clearExamSubmissionBundle,
  saveExamSubmissionBundle,
} from "@/lib/examResultStorage";
import { authService } from "@/lib/auth";
import ExamHeader from "../components/ExamHeader";
import ExamLoadingShell from "../components/ExamLoadingShell";
import SubmitConfirmModal from "../components/SubmitConfirmModal";
import { clsx } from "clsx";
import { Spin } from "antd";
import { Clock, Menu, X } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const submitInFlight = useRef(false);
  const autoSubmitFired = useRef(false);

  const handleLogout = useCallback(async () => {
    const token = authService.getAccessToken();
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch {
        /* still clear locally */
      }
    }
    authService.logout();
    clearExamSubmissionBundle();
    dispatch(resetExam());
    dispatch(resetAuth());
    setMobileMenuOpen(false);
    router.push("/create-account");
  }, [dispatch, router]);

  const submitExam = useCallback(async () => {
    if (submitInFlight.current || !questions.length) return;
    submitInFlight.current = true;
    setSubmitting(true);
    let staySubmittingForNavigation = false;
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
        staySubmittingForNavigation = true;
        router.push("/exam/result");
      } else {
        setShowSubmitModal(false);
        alert(res.message || "Submit failed");
      }
    } catch {
      setShowSubmitModal(false);
      alert("Submit failed. Try again.");
    } finally {
      submitInFlight.current = false;
      if (!staySubmittingForNavigation) {
        setSubmitting(false);
      }
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
    if (!showSubmitModal && !showParagraph && !mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSubmitModal, showParagraph, mobileMenuOpen]);

  const { questionsAnswered, markedForReviewCount } = useMemo(() => {
    return questions.reduce(
      (acc, question) => {
        if (answers[question.id] != null) acc.questionsAnswered += 1;
        if (markedForReview[question.id]) acc.markedForReviewCount += 1;
        return acc;
      },
      { questionsAnswered: 0, markedForReviewCount: 0 }
    );
  }, [answers, markedForReview, questions]);

  const cellClass = useCallback((index: number) => {
    const qq = questions[index];
    if (!qq) return "";
    const qid = qq.id;
    const ans = answers[qid];
    const vis = visited[qid];
    const mark = markedForReview[qid];
    const current = index === currentIndex;
    const answered = ans != null;

    let base =
      "flex aspect-square w-full min-w-0 items-center justify-center rounded-[2px] border text-[10px] font-semibold leading-none tabular-nums shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-colors sm:mx-auto sm:max-w-[84px] sm:rounded-[7px] sm:text-[14px] md:text-[16px]";

    if (current) {
      base +=
        " z-[1] ring-2 ring-[#7b1fa2] ring-offset-0 sm:ring-[5px]";
    }

    if (answered) {
      if (mark) return clsx(base, "border-[#38a856] bg-[#49b84f] text-white");
      return clsx(base, "border-[#38a856] bg-[#49b84f] text-white");
    }
    if (mark) {
      return clsx(base, "border-[#7b1fa2] bg-[#8000a6] text-white");
    }
    if (vis && !current) {
      return clsx(base, "border-[#ea4d52] bg-[#eb3b40] text-white");
    }
    return clsx(base, "border-slate-200 bg-white text-[#0f172a]");
  }, [answers, currentIndex, markedForReview, questions, visited]);

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
  const questionImageUrl = resolveMediaUrl(q.image);
  const selected = answers[q.id] ?? null;
  const marked = !!markedForReview[q.id];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const qNumPad = String(questions.length).length;
  const remainingTimeFormatted = formatCountdown(Math.max(0, secondsRemaining));

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#f0f2f5] font-sans">
      <div className="shrink-0">
        <header className="relative flex items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-2.5 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0f172a] shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#177A9C]/40"
            aria-expanded={mobileMenuOpen}
            aria-controls="exam-mobile-drawer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand asset */}
            <img
              src="/namelogo2.svg"
              alt="NexLearn"
              width={265}
              height={84}
              className="h-9 w-auto max-w-[min(220px,62vw)] object-contain"
            />
            {/* <p className="mt-0.5 max-w-full truncate text-[11px] font-semibold text-[#334155]">
              Ancient Indian History MCQ
            </p> */}
          </div>
          <span className="h-10 w-10 shrink-0" aria-hidden />
        </header>

        <div className="hidden sm:block">
          <ExamHeader />
        </div>
      </div>

      <div
        id="exam-mobile-drawer"
        className={clsx(
          "fixed inset-0 z-200 sm:hidden",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          tabIndex={mobileMenuOpen ? 0 : -1}
          className={clsx(
            "absolute inset-0 bg-slate-900/45 transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={clsx(
            "absolute top-0 left-0 flex h-dvh w-[min(300px,88vw)] flex-col border-r border-slate-200/90 bg-white shadow-[8px_0_24px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0f172a]">Menu</p>
              <p className="truncate text-xs text-slate-500">
                {meta.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#0f172a] transition-colors hover:bg-slate-50"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-auto w-full rounded-lg bg-[#177A9C] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#146a88] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#177A9C]/40"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* <div className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-1.5 sm:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          MCQ
        </span>
      </div> */}

      <div className="mx-auto flex min-h-0 w-full max-w-500 flex-1 flex-col gap-1.5 px-1.5 py-1.5 sm:gap-3 sm:px-5 sm:py-3 lg:flex-row lg:items-stretch lg:gap-6 lg:px-8 lg:py-3">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:gap-2.5 sm:flex-[1.2] sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none lg:min-h-0 lg:flex-[0.7]">
              <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                <h1 className="min-w-0 flex-1 font-sans text-[15px] font-semibold leading-snug text-[#0f172a] sm:text-lg">
                {meta.title}
                </h1>
                <span className="inline-flex h-7 shrink items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 text-[10px] font-semibold tabular-nums text-[#475569] sm:h-8 sm:w-8 sm:px-0 sm:text-xs">
                  {String(currentIndex + 1).padStart(qNumPad, "0")}/
                  {questions.length}
                </span>
              </div>
          <div className="flex min-h-[min(45vh,320px)] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:min-h-0">
            <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-1.5 pt-1 sm:px-5 sm:pb-4">
              <div className="rounded-lg bg-white p-2 sm:p-4">
                {hasComprehensionPassage && (
                  <button
                    type="button"
                    onClick={() => setShowParagraph(true)}
                    aria-expanded={showParagraph}
                    className="mb-2.5 inline-flex max-w-full items-center justify-start gap-2 self-start rounded-lg border border-[#066a8a]/30 bg-[#087ea4] px-3 py-2 text-left text-[13px] font-semibold leading-snug text-white shadow-sm transition-colors hover:bg-[#066a8a] sm:py-2 sm:text-[14px]"
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

                <p className="text-[15px] leading-relaxed text-[#334155] sm:text-base">
                  <span className="font-semibold text-[#0f172a]">
                    {currentIndex + 1}.
                  </span>{" "}
                  {q.question_text}
                </p>

                {questionImageUrl && (
                  <div className="mt-2.5 overflow-hidden rounded-md border border-slate-200/90 bg-slate-50/60 sm:mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={questionImageUrl}
                      alt=""
                      className="block max-h-[min(80px,24vh)] w-auto max-w-full object-contain object-left sm:max-h-[min(220px,28vh)]"
                    />
                  </div>
                )}

                <div className="mt-3 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                  <p className="mb-2 text-[13px] font-semibold text-[#475569] sm:text-sm">
                    Choose the answer:
                  </p>
                  <ul className="space-y-2">
                    {q.options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const isSel = selected === opt.id;
                      return (
                        <li key={opt.id}>
                          <label
                            className={clsx(
                              "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-all sm:min-h-14 sm:px-4 sm:py-3",
                              isSel
                                ? "border-[#1e2d3b] bg-slate-50 shadow-sm ring-1 ring-[#1e2d3b]/15"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                          >
                            <span className="min-w-0 flex-1 text-[13px] leading-snug text-[#334155] sm:text-sm">
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
            </div>
          </div>

          <div className="shrink-0 grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-3">
            <button
              type="button"
              onClick={() => dispatch(toggleMarkForReview(q.id))}
              className={clsx(
                "order-1 col-span-2 flex flex-row items-center justify-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors sm:order-0 sm:col-span-1 sm:px-[29.2399px] sm:py-[13.4953px] sm:text-sm",
                marked
                  ? "bg-[#6d006d] hover:bg-[#5a005a]"
                  : "bg-[#800080] hover:bg-[#6d006d]"
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
                className="order-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:order-0 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Previous
            </button>
            {isLast ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(true)}
                className="order-3 w-full rounded-lg bg-[#1e2d3b] px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2838] disabled:opacity-60 sm:order-0 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Submit exam
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  dispatch(setCurrentIndex(currentIndex + 1))
                }
                className="order-3 w-full rounded-lg bg-[#1e2d3b] px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2838] sm:order-0 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Next
              </button>
            )}
          </div>
        </section>

        <aside className="flex max-h-[min(26vh,200px)] min-h-0 w-full shrink-0 flex-col rounded-lg border border-slate-200/80 bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:max-h-none sm:flex-1 sm:shrink sm:rounded-xl sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none lg:h-full lg:w-80 lg:flex-[0.9] xl:w-88">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:rounded-xl">
            <div className="shrink-0 px-1 pt-1 sm:px-0 sm:pt-0">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                <span className="text-[10px] font-semibold leading-tight text-[#334155] sm:text-sm">
                  Question No. Sheet:
                </span>
                <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-1 sm:shrink-0 sm:gap-2">
                  <span className="text-[9px] font-medium leading-tight text-[#64748b] sm:text-xs">
                    Remaining Time:
                  </span>
                  <span className="inline-flex h-5 min-w-0 shrink-0 items-center gap-0.5 rounded bg-[#0f172a] px-1.5 py-0 text-[9px] font-bold tabular-nums text-white shadow-inner sm:h-8 sm:gap-1 sm:rounded-md sm:px-2.5 sm:py-0.5 sm:text-[13px]">
                    <Clock className="h-2.5 w-2.5 shrink-0 opacity-90 sm:h-3.5 sm:w-3.5" />
                    {remainingTimeFormatted}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="scrollbar-minimal grid min-h-0 flex-1 grid-cols-8 gap-0.5 overflow-y-auto overscroll-contain bg-[#f5f9fc] px-1 pb-1 pt-0.5 sm:grid-cols-10 sm:gap-3 sm:bg-transparent sm:px-5 sm:py-0 sm:pb-2.5 sm:pt-1.5"
            >
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => dispatch(setCurrentIndex(index))}
                  className={cellClass(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="shrink-0 border-t border-slate-100 px-1 py-1 sm:p-5 sm:pt-4">
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[8px] leading-tight text-slate-600 sm:gap-x-5 sm:gap-y-2.5 sm:text-xs">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded border border-emerald-600 bg-emerald-500 sm:h-3 sm:w-3" />
                Attended
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded border border-red-300 bg-red-500 sm:h-3 sm:w-3" />
                Not Attended
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded border border-purple-500 bg-purple-600 sm:h-3 sm:w-3" />
                Marked
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <span className="relative h-2 w-2 shrink-0 rounded border border-purple-600 bg-emerald-500 sm:h-3 sm:w-3 sm:border-2" />
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
        remainingTimeFormatted={remainingTimeFormatted}
        totalQuestions={questions.length}
        questionsAnswered={questionsAnswered}
        markedForReviewCount={markedForReviewCount}
        submitting={submitting}
      />

      <Spin
        spinning={submitting}
        fullscreen
        size="large"
      />

      {showParagraph && hasComprehensionPassage && (
        <div
          className="fixed inset-0 z-130 flex items-center justify-center bg-black/78 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Comprehensive paragraph"
          onClick={() => setShowParagraph(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-700 sm:text-base">
                Comprehensive Paragraph
              </h2>
            </div>
            <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              {comprehensionText}
            </div>
            <div className="shrink-0 border-t border-slate-100 px-5 py-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowParagraph(false)}
                  className="rounded-lg bg-[#1e2d3b] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a2838]"
                >
                  Minimize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

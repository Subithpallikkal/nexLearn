"use client";

import { Clock, FileText, Bookmark, CheckSquare, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  remainingTimeFormatted: string;
  totalQuestions: number;
  questionsAnswered: number;
  markedForReviewCount: number;
  submitting: boolean;
};

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export default function SubmitConfirmModal({
  open,
  onClose,
  onConfirm,
  remainingTimeFormatted,
  totalQuestions,
  questionsAnswered,
  markedForReviewCount,
  submitting,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2
            id="submit-modal-title"
            className="pr-6 font-sans text-base font-semibold leading-snug text-[#0f172a] sm:text-lg"
          >
            Are you sure you want to submit the test?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-0 divide-y divide-slate-100 px-5 py-2">
          <div className="flex items-center gap-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e2d3b] text-white">
              <Clock className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-sm text-[#64748b]">Remaining Time:</span>
              <span className="text-sm font-semibold tabular-nums text-[#0f172a]">
                {remainingTimeFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-white">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-sm text-[#64748b]">Total Questions:</span>
              <span className="text-sm font-semibold tabular-nums text-[#0f172a]">
                {totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <CheckSquare className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-sm text-[#64748b]">Questions Answered:</span>
              <span className="text-sm font-semibold tabular-nums text-[#0f172a]">
                {pad3(questionsAnswered)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
              <Bookmark className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-sm text-[#64748b]">Marked for review:</span>
              <span className="text-sm font-semibold tabular-nums text-[#0f172a]">
                {pad3(markedForReviewCount)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 pt-4">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="w-full rounded-xl bg-[#1e2d3b] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a2838] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

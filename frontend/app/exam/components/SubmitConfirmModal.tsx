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
        className="absolute inset-0 bg-black/78"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[20rem] overflow-hidden rounded-xl bg-white shadow-xl sm:max-w-88">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <h2
            id="submit-modal-title"
            className="min-w-0 flex-1 truncate whitespace-nowrap pr-2 font-sans text-xs font-semibold leading-snug text-[#0f172a] sm:text-sm"
          >
            Are you sure you want to submit the test?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(60vh,22rem)] space-y-0 divide-y divide-slate-100 overflow-y-auto px-4 py-1">
          <div className="flex items-center gap-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1e2d3b] text-white">
              <Clock className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-xs text-[#64748b] sm:text-[13px]">Remaining Time:</span>
              <span className="text-xs font-semibold tabular-nums text-[#0f172a] sm:text-[13px]">
                {remainingTimeFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-400 text-white">
              <FileText className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-xs text-[#64748b] sm:text-[13px]">Total Questions:</span>
              <span className="text-xs font-semibold tabular-nums text-[#0f172a] sm:text-[13px]">
                {totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
              <CheckSquare className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-xs text-[#64748b] sm:text-[13px]">Questions Answered:</span>
              <span className="text-xs font-semibold tabular-nums text-[#0f172a] sm:text-[13px]">
                {pad3(questionsAnswered)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-600 text-white">
              <Bookmark className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-xs text-[#64748b] sm:text-[13px]">Marked for review:</span>
              <span className="text-xs font-semibold tabular-nums text-[#0f172a] sm:text-[13px]">
                {pad3(markedForReviewCount)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="w-full rounded-lg bg-[#1e2d3b] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a2838] disabled:opacity-60 sm:text-[13px]"
          >
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

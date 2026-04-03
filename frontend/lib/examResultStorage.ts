import type { SubmitAnswersResponse } from "@/lib/examApi";

const BUNDLE_KEY = "nexlearn_exam_submission_bundle";

export type ExamMetaSnapshot = {
  total_marks: number;
  questions_count: number;
};

export type StoredExamSubmission = {
  result: SubmitAnswersResponse;
  meta: ExamMetaSnapshot | null;
};

export function saveExamSubmissionBundle(
  result: SubmitAnswersResponse,
  meta: ExamMetaSnapshot | null
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredExamSubmission = { result, meta };
    localStorage.setItem(BUNDLE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function getExamSubmissionBundle(): StoredExamSubmission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUNDLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredExamSubmission;
    if (!parsed?.result || typeof parsed.result.success !== "boolean") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearExamSubmissionBundle(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BUNDLE_KEY);
}

export function hasSuccessfulSubmission(): boolean {
  return getExamSubmissionBundle()?.result.success === true;
}

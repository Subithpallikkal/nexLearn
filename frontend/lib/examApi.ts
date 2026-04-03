const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

function pickStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function pickNum(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Map backend variants (snake_case, camelCase, alternate keys) to our UI shape */
function normalizeOption(
  raw: Record<string, unknown>,
  index: number
): QuestionOption {
  const id = pickNum(
    raw.id ?? raw.option_id ?? raw.optionId,
    index + 1
  );
  const option_text = pickStr(
    raw.option_text ??
      raw.optionText ??
      raw.text ??
      raw.title ??
      raw.label ??
      raw.name ??
      raw.option
  );
  return { id, option_text };
}

/**
 * Prefer API `comprehension`: explicit `null` means no passage (hide button).
 * If `comprehension` is omitted, fall back to legacy `comprehensive_paragraph` / `passage` keys.
 */
function resolveComprehension(
  raw: Record<string, unknown>
): string | null | undefined {
  if (Object.prototype.hasOwnProperty.call(raw, "comprehension")) {
    const v = raw.comprehension;
    if (v === null) return null;
    const s = pickStr(v).trim();
    return s.length > 0 ? s : null;
  }
  const legacy = pickStr(
    raw.comprehensive_paragraph ??
      raw.comprehensiveParagraph ??
      raw.paragraph ??
      raw.comprehensive_text ??
      raw.passage
  ).trim();
  return legacy.length > 0 ? legacy : undefined;
}

function normalizeQuestion(
  raw: Record<string, unknown>,
  index: number
): Question {
  const id = pickNum(raw.id ?? raw.question_id ?? raw.questionId, index + 1);
  const question_text = pickStr(
    raw.question_text ??
      raw.questionText ??
      raw.question ??
      raw.text ??
      raw.title ??
      raw.name ??
      raw.description
  );

  let rawOpts: unknown =
    raw.options ??
    raw.choices ??
    raw.question_options ??
    raw.questionOptions ??
    raw.answer_options ??
    raw.answerOptions ??
    raw.option ??
    raw.options_list ??
    raw.optionList;
  if (typeof rawOpts === "string") {
    try {
      const parsed: unknown = JSON.parse(rawOpts);
      if (Array.isArray(parsed)) rawOpts = parsed;
    } catch {
      rawOpts = [];
    }
  }
  let options: QuestionOption[] = [];
  if (Array.isArray(rawOpts)) {
    options = rawOpts.map((o, i) =>
      normalizeOption(
        typeof o === "object" && o !== null
          ? (o as Record<string, unknown>)
          : {},
        i
      )
    );
  }

  const img = pickStr(
    raw.image ??
      raw.image_url ??
      raw.imageUrl ??
      raw.question_image ??
      raw.questionImage ??
      raw.media_url ??
      raw.mediaUrl ??
      raw.picture ??
      raw.photo ??
      raw.diagram ??
      raw.diagram_url ??
      raw.diagramUrl
  );
  const comprehension = resolveComprehension(raw);
  const text =
    typeof comprehension === "string" ? comprehension : undefined;

  return {
    id,
    question_text,
    options,
    image: img || undefined,
    comprehension,
    comprehensive_paragraph: text,
  };
}

function unwrapQuestionsArray(payload: Record<string, unknown>): unknown[] {
  if (Array.isArray(payload.questions)) return payload.questions;
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.questions)) return d.questions;
  }
  return [];
}

/** Normalize remote /question/list JSON so UI always gets question_text + option_text */
export function normalizeQuestionListResponse(
  raw: unknown
): QuestionListResponse {
  const p =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const list = unwrapQuestionsArray(p);
  const questions = list.map((item, i) =>
    normalizeQuestion(
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {},
      i
    )
  );

  const dataBlock =
    p.data && typeof p.data === "object" && !Array.isArray(p.data)
      ? (p.data as Record<string, unknown>)
      : null;

  const num = (top: Record<string, unknown>, key: string, alt?: string) =>
    pickNum(
      top[key] ??
        (alt ? top[alt] : undefined) ??
        (dataBlock ? dataBlock[key] : undefined) ??
        (dataBlock && alt ? dataBlock[alt] : undefined),
      0
    );

  const str = (top: Record<string, unknown>, key: string, alt?: string) =>
    pickStr(
      top[key] ??
        (alt ? top[alt] : undefined) ??
        (dataBlock ? dataBlock[key] : undefined) ??
        (dataBlock && alt ? dataBlock[alt] : undefined)
    );

  return {
    success: Boolean(p.success),
    questions_count: num(p, "questions_count", "questionsCount") || questions.length,
    total_marks: num(p, "total_marks", "totalMarks"),
    total_time: num(p, "total_time", "totalTime"),
    time_for_each_question: num(
      p,
      "time_for_each_question",
      "timeForEachQuestion"
    ),
    mark_per_each_answer: num(
      p,
      "mark_per_each_answer",
      "markPerEachAnswer"
    ),
    instruction: str(p, "instruction"),
    questions,
    message: pickStr(p.message),
    exam_name: pickStr(p.exam_name ?? p.examName) || undefined,
  };
}

export interface QuestionOption {
  id: number;
  option_text: string;
}

export interface Question {
  id: number;
  question_text: string;
  options: QuestionOption[];
  image?: string | null;
  /** Primary API field; explicit `null` = no passage (hide button). */
  comprehension?: string | null;
  /** Same text as `comprehension` when string; kept for older references. */
  comprehensive_paragraph?: string | null;
}

export interface QuestionListResponse {
  success: boolean;
  questions_count: number;
  total_marks: number;
  total_time: number;
  time_for_each_question: number;
  mark_per_each_answer: number;
  instruction: string;
  questions: Question[];
  message?: string;
  exam_name?: string;
}

export interface AnswerSubmission {
  question_id: number;
  selected_option_id: number | null;
}

/** Legacy / alternate submit detail shape */
export interface AnswerResult {
  question_id: number;
  question_text: string;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
}

/** Current API submit detail item */
export interface SubmitResultDetail {
  question_id: number;
  selected_option_id: number | null;
  correct_option_id?: number | null;
  is_correct: boolean | null;
  status?: string;
  question_text?: string;
  selected_option?: string | null;
  correct_option?: string | null;
}

export interface SubmitAnswersResponse {
  success: boolean;
  exam_history_id: string | number;
  score: number;
  correct: number;
  wrong: number;
  not_attended: number;
  submitted_at: string;
  details: (SubmitResultDetail | AnswerResult)[];
  message?: string;
}

export function normalizeSubmitResponse(raw: unknown): SubmitAnswersResponse {
  const p =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const detailsRaw = p.details;
  const details = Array.isArray(detailsRaw)
    ? (detailsRaw as (SubmitResultDetail | AnswerResult)[])
    : [];

  return {
    success: Boolean(p.success),
    exam_history_id: (p.exam_history_id ?? p.examHistoryId ?? "") as
      | string
      | number,
    score: Number(p.score) || 0,
    correct: Number(p.correct) || 0,
    wrong: Number(p.wrong) || 0,
    not_attended: Number(p.not_attended ?? p.notAttended) || 0,
    submitted_at: pickStr(p.submitted_at ?? p.submittedAt),
    details,
    message: pickStr(p.message) || undefined,
  };
}

export async function fetchQuestionList(): Promise<QuestionListResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch("/api/question/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const raw = await response.json();
  return normalizeQuestionListResponse(raw);
}

/**
 * POST /answers/submit — same shape as backend: multipart form field `answers`
 * (JSON string of `{ question_id, selected_option_id }[]`) + Bearer token.
 */
export async function submitAnswersApi(
  answers: AnswerSubmission[]
): Promise<SubmitAnswersResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));

  const response = await fetch("/api/answers/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const raw = await response.json();
  return normalizeSubmitResponse(raw);
}

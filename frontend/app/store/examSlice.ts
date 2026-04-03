import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Question,
  QuestionListResponse,
  SubmitAnswersResponse,
} from "@/lib/examApi";

export interface ExamMeta {
  questions_count: number;
  total_marks: number;
  total_time: number;
  time_for_each_question: number;
  mark_per_each_answer: number;
  instruction: string;
  title: string;
}

interface ExamState {
  loaded: boolean;
  meta: ExamMeta | null;
  questions: Question[];
  /** question id -> selected option id (null = none chosen) */
  answers: Record<number, number | null>;
  markedForReview: Record<number, boolean>;
  visited: Record<number, boolean>;
  currentIndex: number;
  /** seconds remaining; null until exam starts */
  secondsRemaining: number | null;
  examStarted: boolean;
  lastSubmitResult: SubmitAnswersResponse | null;
}

const initialState: ExamState = {
  loaded: false,
  meta: null,
  questions: [],
  answers: {},
  markedForReview: {},
  visited: {},
  currentIndex: 0,
  secondsRemaining: null,
  examStarted: false,
  lastSubmitResult: null,
};

const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    loadQuestionList: (state, action: PayloadAction<QuestionListResponse>) => {
      const p = action.payload;
      state.loaded = true;
      state.meta = {
        questions_count: p.questions_count,
        total_marks: p.total_marks,
        total_time: p.total_time,
        time_for_each_question: p.time_for_each_question,
        mark_per_each_answer: p.mark_per_each_answer,
        instruction: p.instruction ?? "",
        title: p.exam_name?.trim() || "Online examination",
      };
      state.questions = p.questions ?? [];
      state.answers = {};
      state.markedForReview = {};
      state.visited = {};
      state.currentIndex = 0;
      state.secondsRemaining = null;
      state.examStarted = false;
      state.lastSubmitResult = null;
    },
    startExam: (state) => {
      if (!state.meta) return;
      state.examStarted = true;
      const t = state.meta.total_time;
      state.secondsRemaining = t > 300 ? t : t * 60;
    },
    tickTimer: (state) => {
      if (state.secondsRemaining === null || state.secondsRemaining <= 0) return;
      state.secondsRemaining -= 1;
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      const i = action.payload;
      if (i < 0 || !state.questions.length || i >= state.questions.length)
        return;
      const prev = state.currentIndex;
      const prevQ = state.questions[prev];
      if (prevQ) state.visited[prevQ.id] = true;
      state.currentIndex = i;
      const q = state.questions[i];
      if (q) state.visited[q.id] = true;
    },
    setAnswer: (
      state,
      action: PayloadAction<{ questionId: number; optionId: number | null }>
    ) => {
      const { questionId, optionId } = action.payload;
      state.answers[questionId] = optionId;
    },
    toggleMarkForReview: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.markedForReview[id] = !state.markedForReview[id];
    },
    setSubmitResult: (
      state,
      action: PayloadAction<SubmitAnswersResponse | null>
    ) => {
      state.lastSubmitResult = action.payload;
      state.examStarted = false;
    },
    resetExam: () => initialState,
  },
});

export const {
  loadQuestionList,
  startExam,
  tickTimer,
  setCurrentIndex,
  setAnswer,
  toggleMarkForReview,
  setSubmitResult,
  resetExam,
} = examSlice.actions;

export default examSlice.reducer;

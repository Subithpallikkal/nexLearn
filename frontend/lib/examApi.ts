const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface QuestionOption {
  id: number;
  option_text: string;
}

export interface Question {
  id: number;
  question_text: string;
  options: QuestionOption[];
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
}

export interface AnswerSubmission {
  question_id: number;
  selected_option_id: number | null;
}

export interface AnswerResult {
  question_id: number;
  question_text: string;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
}

export interface SubmitAnswersResponse {
  success: boolean;
  exam_history_id: string;
  score: number;
  correct: number;
  wrong: number;
  not_attended: number;
  submitted_at: string;
  details: AnswerResult[];
}

export const examApi = {
  getQuestions: async (token: string): Promise<QuestionListResponse> => {
    const response = await fetch(`${API_BASE_URL}/question/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  submitAnswers: async (answers: AnswerSubmission[], token: string): Promise<SubmitAnswersResponse> => {
    const response = await fetch(`${API_BASE_URL}/answers/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers, token }),
    });
    return response.json();
  },
};

export default examApi;

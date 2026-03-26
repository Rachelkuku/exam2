export type Question = {
  id: string;
  number: number;
  subject: string;
  question: string;
  figureImage?: string;
  choices: string[];
  answer: number;
};

export type Exam = {
  examId: string;
  examTitle: string;
  year: number;
  round: number;
  questions: Question[];
};

export type AnswerMap = Record<string, number>;
export type NoteMap = Record<string, string>;

export type ExamSubmission = {
  examId: string;
  answers: AnswerMap;
  notes: NoteMap;
  submittedAt: string;
};

export type QuestionResult = {
  question: Question;
  selectedAnswer?: number;
  note?: string;
  isCorrect: boolean;
};

export type GradingSummary = {
  results: QuestionResult[];
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracy: number;
};

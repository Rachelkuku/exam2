import { exams } from "@/data/exams";

export function getAllExams() {
  return exams;
}

export function getExamById(examId: string) {
  return exams.find((exam) => exam.examId === examId);
}

export function getQuestionById(examId: string, questionId: string) {
  return getExamById(examId)?.questions.find((question) => question.id === questionId);
}

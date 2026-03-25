import type { AnswerMap, Exam, GradingSummary, NoteMap } from "@/types/exam";

export function gradeExam(exam: Exam, answers: AnswerMap, notes: NoteMap = {}): GradingSummary {
  const results = exam.questions.map((question) => {
    const selectedAnswer = answers[question.id];

    return {
      question,
      selectedAnswer,
      note: notes[question.id]?.trim() || undefined,
      isCorrect: selectedAnswer === question.answer,
    };
  });

  const correctCount = results.filter((result) => result.isCorrect).length;
  const unansweredCount = results.filter(
    (result) => result.selectedAnswer === undefined,
  ).length;

  return {
    results,
    totalCount: results.length,
    correctCount,
    wrongCount: results.length - correctCount,
    unansweredCount,
    accuracy: results.length === 0 ? 0 : Math.round((correctCount / results.length) * 100),
  };
}

import type { Exam, Question } from "@/types/exam";

export function formatChoice(choiceNumber?: number) {
  return choiceNumber === undefined ? "미응답" : `${choiceNumber}번`;
}

export function buildExplanationPrompt(
  exam: Exam,
  question: Question,
  selectedAnswer?: number,
) {
  const choices = question.choices
    .map((choice, index) => `${index + 1}. ${choice}`)
    .join("\n");

  return `${exam.examTitle} ${question.number}번
과목: ${question.subject}

문제:
${question.question}

보기:
${choices}

내가 고른 답: ${formatChoice(selectedAnswer)}
정답: ${question.answer}번

이 문제를 초보자도 이해하게 설명해줘.
정답인 이유와 나머지 선지가 왜 틀렸는지도 알려줘.
관련 개념도 같이 정리해줘.`;
}

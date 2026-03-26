import type { Exam, Question } from "@/types/exam";

const COMPOSITE_LABELS = ["(가)", "(나)", "(다)", "(라)", "(마)"];

export function formatChoice(choiceNumber?: number) {
  return choiceNumber === undefined ? "미응답" : `${choiceNumber}번`;
}

export function formatChoiceText(choice: string) {
  const parts = choice
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return choice.trim();
  }

  const hasCompositeLabels = parts.some((part) => /^\((가|나|다|라|마)\)/.test(part));

  if (hasCompositeLabels) {
    return parts.join(" / ");
  }

  return parts
    .map((part, index) => `${COMPOSITE_LABELS[index] ?? `(${index + 1})`} ${part}`)
    .join(" / ");
}

export function formatChoiceWithText(choices: string[], choiceNumber?: number) {
  if (choiceNumber === undefined) {
    return "미응답";
  }

  const choiceText = choices[choiceNumber - 1]?.trim();

  return choiceText ? `${choiceNumber}번 (${formatChoiceText(choiceText)})` : `${choiceNumber}번`;
}

export function buildExplanationPrompt(
  exam: Exam,
  question: Question,
  selectedAnswer?: number,
) {
  const choices = question.choices
    .map((choice, index) => `${index + 1}. ${formatChoiceText(choice)}`)
    .join("\n");

  return `${exam.examTitle} ${question.number}번
과목: ${question.subject}

문제:
${question.question}

보기:
${choices}

내가 고른 답: ${formatChoiceWithText(question.choices, selectedAnswer)}
정답: ${formatChoiceWithText(question.choices, question.answer)}

이 문제를 초보자도 이해하게 설명해줘.
정답인 이유와 나머지 선지가 왜 틀렸는지도 알려줘.
관련 개념도 같이 정리해줘.`;
}

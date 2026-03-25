import type { Question } from "@/types/exam";
import ChoiceList from "@/components/ChoiceList";

type QuestionCardProps = {
  question: Question;
  selectedAnswer?: number;
  onSelect?: (choiceNumber: number) => void;
  readOnly?: boolean;
};

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  readOnly = false,
}: QuestionCardProps) {
  return (
    <div className="question-card">
      <div className="question-card__header">
        <span className="pill">{question.subject}</span>
        <span className="muted">{question.number}번</span>
      </div>
      <h2>{question.question}</h2>
      <ChoiceList
        question={question}
        selectedAnswer={selectedAnswer}
        answer={readOnly ? question.answer : undefined}
        onSelect={onSelect}
        readOnly={readOnly}
      />
    </div>
  );
}

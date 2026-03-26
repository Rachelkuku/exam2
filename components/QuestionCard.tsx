import ChoiceList from "@/components/ChoiceList";
import type { Question } from "@/types/exam";

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
      {question.figureImage ? (
        <div className="question-figure">
          <img
            className="question-figure__image"
            src={question.figureImage}
            alt={`${question.number}번 문제 표 이미지`}
          />
        </div>
      ) : null}
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

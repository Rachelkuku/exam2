import { formatChoiceText } from "@/lib/format";
import type { Question } from "@/types/exam";

type ChoiceListProps = {
  question: Question;
  selectedAnswer?: number;
  answer?: number;
  onSelect?: (choiceNumber: number) => void;
  readOnly?: boolean;
};

export default function ChoiceList({
  question,
  selectedAnswer,
  answer,
  onSelect,
  readOnly = false,
}: ChoiceListProps) {
  return (
    <div className="choice-list">
      {question.choices.map((choice, index) => {
        const choiceNumber = index + 1;
        const isSelected = selectedAnswer === choiceNumber;
        const isAnswer = answer === choiceNumber;

        return readOnly ? (
          <div
            key={`${question.id}-${choiceNumber}`}
            className={`choice choice--static ${isSelected ? "choice--mine" : ""} ${
              isAnswer ? "choice--answer" : ""
            }`}
          >
            <span className="choice__number">{choiceNumber}</span>
            <div className="choice__body">
              <span>{formatChoiceText(choice)}</span>
              <div className="choice__tags">
                {isSelected ? <span className="tag">내 답</span> : null}
                {isAnswer ? <span className="tag tag--answer">정답</span> : null}
              </div>
            </div>
          </div>
        ) : (
          <button
            key={`${question.id}-${choiceNumber}`}
            type="button"
            className={`choice ${isSelected ? "choice--selected" : ""}`}
            onClick={() => onSelect?.(choiceNumber)}
          >
            <span className="choice__number">{choiceNumber}</span>
            <span>{formatChoiceText(choice)}</span>
          </button>
        );
      })}
    </div>
  );
}

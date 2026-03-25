import Link from "next/link";
import { formatChoice } from "@/lib/format";
import type { QuestionResult } from "@/types/exam";

type WrongQuestionListProps = {
  examId: string;
  results: QuestionResult[];
};

export default function WrongQuestionList({ examId, results }: WrongQuestionListProps) {
  if (results.length === 0) {
    return (
      <div className="empty-inline">
        <strong>틀린 문제가 없습니다.</strong>
        <p>이번 회차는 모두 맞았습니다. 다른 회차를 고르거나 다시 도전해보세요.</p>
      </div>
    );
  }

  return (
    <div className="result-list">
      {results.map((result) => (
        <article key={result.question.id} className="result-row">
          <div className="result-row__main">
            <div className="result-row__title">
              <span className="badge badge--wrong">오답</span>
              <strong>{result.question.number}번</strong>
              <span className="muted">{result.question.subject}</span>
            </div>
            <p>{result.question.question}</p>
            {result.note ? (
              <div className="note-preview">
                <strong>내 메모</strong>
                <p>{result.note}</p>
              </div>
            ) : null}
          </div>
          <div className="result-row__meta">
            <span>내 답 {formatChoice(result.selectedAnswer)}</span>
            <span>정답 {formatChoice(result.question.answer)}</span>
            <Link href={`/exam/${examId}/question/${result.question.id}`}>상세 보기</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

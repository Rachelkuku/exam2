"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import WrongQuestionList from "@/components/WrongQuestionList";
import { gradeExam } from "@/lib/grading";
import { readSubmission } from "@/lib/storage";
import type { Exam } from "@/types/exam";

type WrongNoteViewProps = {
  exam: Exam;
};

export default function WrongNoteView({ exam }: WrongNoteViewProps) {
  const [submission] = useState(() => readSubmission(exam.examId));
  const wrongResults = useMemo(() => {
    return gradeExam(exam, submission?.answers ?? {}, submission?.notes ?? {}).results.filter(
      (result) => !result.isCorrect,
    );
  }, [exam, submission]);

  if (!submission) {
    return (
      <div className="shell">
        <section className="empty-state">
          <p className="eyebrow">오답노트</p>
          <h1>제출된 결과가 없습니다.</h1>
          <p>오답노트는 시험 제출 후 생성됩니다.</p>
          <div className="empty-state__actions">
            <Link className="button button--accent" href={`/exam/${exam.examId}`}>
              시험 풀기
            </Link>
            <Link className="button button--ghost" href="/">
              홈으로
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="hero hero--compact">
        <div>
          <p className="eyebrow">오답노트</p>
          <h1 className="hero__title--exam">{exam.examTitle}</h1>
          <p className="hero__body">
            틀린 문제만 모아서 다시 확인하고, 상세 화면에서 해설 요청용 복사를 할 수 있습니다.
          </p>
        </div>
        <div className="hero__meta">
          <span>오답 {wrongResults.length}개</span>
          <Link href={`/exam/${exam.examId}/result`}>결과 화면으로</Link>
        </div>
      </section>

      <section className="panel">
        <WrongQuestionList examId={exam.examId} results={wrongResults} />
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ResultSummary from "@/components/ResultSummary";
import { formatChoice } from "@/lib/format";
import { gradeExam } from "@/lib/grading";
import { clearExamStorage, readSubmission } from "@/lib/storage";
import type { Exam } from "@/types/exam";

type ResultViewProps = {
  exam: Exam;
};

export default function ResultView({ exam }: ResultViewProps) {
  const router = useRouter();
  const [submission] = useState(() => readSubmission(exam.examId));
  const summary = useMemo(
    () => gradeExam(exam, submission?.answers ?? {}, submission?.notes ?? {}),
    [exam, submission],
  );

  function handleRetry() {
    clearExamStorage(exam.examId);
    router.push(`/exam/${exam.examId}`);
  }

  if (!submission) {
    return (
      <div className="shell">
        <section className="empty-state">
          <p className="eyebrow">결과 없음</p>
          <h1>제출된 기록을 찾지 못했습니다.</h1>
          <p>먼저 시험을 풀고 제출하면 채점 결과와 오답노트를 확인할 수 있습니다.</p>
          <div className="empty-state__actions">
            <Link className="button button--accent" href={`/exam/${exam.examId}`}>
              시험 풀러 가기
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
          <p className="eyebrow">채점 결과</p>
          <h1 className="hero__title--exam">{exam.examTitle}</h1>
          <p className="hero__body">
            총 {summary.totalCount}문제 중 {summary.correctCount}문제를 맞혔습니다.
          </p>
        </div>
        <div className="hero__meta">
          <span>정답 {summary.correctCount}</span>
          <span>오답 {summary.wrongCount}</span>
          <span>정답률 {summary.accuracy}%</span>
        </div>
      </section>

      <ResultSummary
        totalCount={summary.totalCount}
        correctCount={summary.correctCount}
        wrongCount={summary.wrongCount}
        unansweredCount={summary.unansweredCount}
      />

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">문제별 결과</p>
            <h2>내 답안과 정답 비교</h2>
          </div>
          <div className="section-heading__actions">
            <Link className="button button--ghost" href="/wrong-notes">
              전체 오답노트
            </Link>
            <Link className="button button--ghost" href={`/exam/${exam.examId}/wrong`}>
              이 시험 오답노트
            </Link>
            <button type="button" className="button button--accent" onClick={handleRetry}>
              다시 풀기
            </button>
          </div>
        </div>

        <div className="result-list">
          {summary.results.map((result) => (
            <article key={result.question.id} className="result-row">
              <div className="result-row__main">
                <div className="result-row__title">
                  <span className={`badge ${result.isCorrect ? "badge--correct" : "badge--wrong"}`}>
                    {result.isCorrect ? "맞음" : "오답"}
                  </span>
                  <strong>{result.question.number}번</strong>
                  <span className="muted">{result.question.subject}</span>
                </div>
                <p className="result-row__question">{result.question.question}</p>
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
                <Link href={`/exam/${exam.examId}/question/${result.question.id}`}>상세 보기</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ChoiceList from "@/components/ChoiceList";
import { gradeExam } from "@/lib/grading";
import { formatChoice } from "@/lib/format";
import { readAllSubmissions } from "@/lib/storage";
import type { Exam, QuestionResult } from "@/types/exam";

type AllWrongNotesViewProps = {
  exams: Exam[];
};

type ReviewItem = {
  exam: Exam;
  result: QuestionResult;
  wrongCount: number;
  submittedAt: string;
};

type RetryAnswerMap = Record<string, number>;

function getRetryKey(examId: string, questionId: string) {
  return `${examId}:${questionId}`;
}

export default function AllWrongNotesView({ exams }: AllWrongNotesViewProps) {
  const [noteOnly, setNoteOnly] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [retryAnswers, setRetryAnswers] = useState<RetryAnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions] = useState(() => readAllSubmissions());

  const reviewItems = useMemo(() => {
    const counts = new Map<string, number>();
    const collected: ReviewItem[] = [];

    for (const submission of submissions) {
      const exam = exams.find((item) => item.examId === submission.examId);

      if (!exam) {
        continue;
      }

      const wrongResults = gradeExam(exam, submission.answers, submission.notes).results.filter(
        (result) => result.selectedAnswer !== undefined && !result.isCorrect,
      );

      for (const result of wrongResults) {
        const key = getRetryKey(exam.examId, result.question.id);
        const nextCount = (counts.get(key) ?? 0) + 1;
        counts.set(key, nextCount);

        collected.push({
          exam,
          result,
          wrongCount: nextCount,
          submittedAt: submission.submittedAt,
        });
      }
    }

    const latestOnly = new Map<string, ReviewItem>();

    for (const item of collected) {
      const key = getRetryKey(item.exam.examId, item.result.question.id);
      const prev = latestOnly.get(key);

      if (!prev || item.submittedAt > prev.submittedAt) {
        latestOnly.set(key, item);
      }
    }

    return [...latestOnly.values()].sort((left, right) => {
      if (right.wrongCount !== left.wrongCount) {
        return right.wrongCount - left.wrongCount;
      }

      return right.submittedAt.localeCompare(left.submittedAt);
    });
  }, [exams, submissions]);

  const filteredItems = useMemo(() => {
    return reviewItems.filter((item) => {
      if (!noteOnly) {
        return true;
      }

      return Boolean(item.result.note);
    });
  }, [noteOnly, reviewItems]);

  const currentRetryItem = filteredItems[currentIndex];
  const currentRetryKey = currentRetryItem
    ? getRetryKey(currentRetryItem.exam.examId, currentRetryItem.result.question.id)
    : "";
  const selectedRetryAnswer = currentRetryKey ? retryAnswers[currentRetryKey] : undefined;
  const isRetryAnswered = selectedRetryAnswer !== undefined;
  const isRetryCorrect = selectedRetryAnswer === currentRetryItem?.result.question.answer;

  function handleRetrySelect(choiceNumber: number) {
    if (!currentRetryItem || isRetryAnswered) {
      return;
    }

    setRetryAnswers((prev) => ({
      ...prev,
      [currentRetryKey]: choiceNumber,
    }));
  }

  function handleRetryStart() {
    setCurrentIndex(0);
    setRetryAnswers({});
    setRetryMode(true);
  }

  if (retryMode) {
    if (!currentRetryItem) {
      return (
        <div className="shell">
          <section className="empty-state">
            <p className="eyebrow">오답 재풀이</p>
            <h1>다시 풀 문제가 없습니다.</h1>
            <div className="empty-state__actions">
              <button type="button" className="button button--accent" onClick={() => setRetryMode(false)}>
                목록으로 돌아가기
              </button>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="shell">
        <section className="hero hero--compact">
          <div>
            <p className="eyebrow">오답 재풀이</p>
            <h1 className="hero__title--exam">틀린 문제만 다시 풀기</h1>
            <p className="hero__body">
              {currentRetryItem.exam.examTitle} · {currentRetryItem.result.question.number}번 문제를 다시 풉니다.
            </p>
          </div>
          <div className="hero__meta">
            <span>
              {currentIndex + 1} / {filteredItems.length}문제
            </span>
            <span>누적 오답 {currentRetryItem.wrongCount}회</span>
            <button type="button" className="button button--ghost" onClick={() => setRetryMode(false)}>
              목록 보기
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{currentRetryItem.exam.examTitle}</p>
              <h2>{currentRetryItem.result.question.question}</h2>
            </div>
          </div>

          <ChoiceList
            question={currentRetryItem.result.question}
            selectedAnswer={selectedRetryAnswer}
            answer={isRetryAnswered ? currentRetryItem.result.question.answer : undefined}
            onSelect={handleRetrySelect}
            readOnly={isRetryAnswered}
          />

          {currentRetryItem.result.note ? (
            <div className="note-panel">
              <span>기존 메모</span>
              <p>{currentRetryItem.result.note}</p>
            </div>
          ) : null}

          {isRetryAnswered ? (
            <div className={`submit-box ${isRetryCorrect ? "submit-box--correct" : "submit-box--wrong"}`}>
              <strong>{isRetryCorrect ? "정답입니다." : "오답입니다."}</strong>
              <p>
                내가 고른 답 {formatChoice(selectedRetryAnswer)}, 정답은{" "}
                {formatChoice(currentRetryItem.result.question.answer)}입니다.
              </p>
            </div>
          ) : (
            <div className="submit-box">
              <strong>답을 선택하세요.</strong>
              <p>선택 즉시 정답 여부가 표시됩니다.</p>
            </div>
          )}

          <div className="session-footer">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              이전 문제
            </button>
            <div className="session-footer__actions">
              <Link
                className="button button--ghost"
                href={`/exam/${currentRetryItem.exam.examId}/question/${currentRetryItem.result.question.id}`}
              >
                상세 보기
              </Link>
              <button
                type="button"
                className="button"
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))}
                disabled={!isRetryAnswered || currentIndex === filteredItems.length - 1}
              >
                다음 문제
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="hero hero--compact">
        <div>
          <p className="eyebrow">통합 오답노트</p>
          <h1 className="hero__title--exam">전체 시험 오답 모아보기</h1>
          <p className="hero__body">
            모든 시험의 틀린 문제를 한곳에 모았습니다. 메모만 따로 보거나 틀린 문제만 다시 풀 수 있습니다.
          </p>
        </div>
        <div className="hero__meta">
          <span>누적 오답 문제 {reviewItems.length}개</span>
          <span>메모 있는 문제 {reviewItems.filter((item) => item.result.note).length}개</span>
          <Link href="/">홈으로</Link>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">복습 필터</p>
            <h2>오답을 모아서 다시 보기</h2>
          </div>
          <div className="section-heading__actions">
            <button
              type="button"
              className={`button ${noteOnly ? "button--accent" : "button--ghost"}`}
              onClick={() => setNoteOnly((prev) => !prev)}
            >
              {noteOnly ? "전체 보기" : "메모 있는 문제만"}
            </button>
            <button
              type="button"
              className="button button--accent"
              onClick={handleRetryStart}
              disabled={filteredItems.length === 0}
            >
              틀린 문제 다시 풀기
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-inline">
            <strong>{noteOnly ? "메모가 있는 오답이 없습니다." : "저장된 오답이 없습니다."}</strong>
            <p>시험을 제출하면 이곳에 전체 오답노트가 쌓입니다.</p>
          </div>
        ) : (
          <div className="result-list">
            {filteredItems.map((item) => (
              <article
                key={getRetryKey(item.exam.examId, item.result.question.id)}
                className="result-row"
              >
                <div className="result-row__main">
                  <div className="result-row__title">
                    <span className="badge badge--wrong">오답 {item.wrongCount}회</span>
                    <strong>
                      {item.exam.examTitle} · {item.result.question.number}번
                    </strong>
                    <span className="muted">{item.result.question.subject}</span>
                  </div>
                  <p className="result-row__question">{item.result.question.question}</p>
                  {item.result.note ? (
                    <div className="note-preview">
                      <strong>내 메모</strong>
                      <p>{item.result.note}</p>
                    </div>
                  ) : null}
                </div>
                <div className="result-row__meta">
                  <span>내 답 {formatChoice(item.result.selectedAnswer)}</span>
                  <span>정답 {formatChoice(item.result.question.answer)}</span>
                  <Link href={`/exam/${item.exam.examId}/question/${item.result.question.id}`}>상세 보기</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

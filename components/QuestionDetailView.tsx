"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ChoiceList from "@/components/ChoiceList";
import CopyExplanationButton from "@/components/CopyExplanationButton";
import { formatChoiceWithText } from "@/lib/format";
import { gradeExam } from "@/lib/grading";
import { readSubmission } from "@/lib/storage";
import type { Exam, Question } from "@/types/exam";

type QuestionDetailViewProps = {
  exam: Exam;
  question: Question;
};

export default function QuestionDetailView({ exam, question }: QuestionDetailViewProps) {
  const [submission] = useState(() => readSubmission(exam.examId));
  const result = useMemo(() => {
    return gradeExam(exam, submission?.answers ?? {}, submission?.notes ?? {}).results.find(
      (item) => item.question.id === question.id,
    );
  }, [exam, question.id, submission]);

  return (
    <div className="shell">
      <section className="hero hero--compact">
        <div>
          <p className="eyebrow">문제 상세</p>
          <h1 className="hero__title--exam">{exam.examTitle}</h1>
          <p className="hero__body">
            {question.number}번 문제의 정답, 내가 고른 답, 메모를 다시 확인합니다.
          </p>
        </div>
        <div className="hero__meta">
          <span>{question.subject}</span>
          <span className={`badge ${result?.isCorrect ? "badge--correct" : "badge--wrong"}`}>
            {result?.isCorrect ? "맞음" : "오답 또는 미응답"}
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">문제 {question.number}</p>
            <h2>{question.question}</h2>
          </div>
          <div className="section-heading__actions">
            <Link className="button button--ghost" href={`/exam/${exam.examId}/wrong`}>
              오답노트
            </Link>
            <CopyExplanationButton
              exam={exam}
              question={question}
              selectedAnswer={result?.selectedAnswer}
            />
          </div>
        </div>

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
          selectedAnswer={result?.selectedAnswer}
          answer={question.answer}
          readOnly
        />

        <div className="detail-grid">
          <article className="detail-card">
            <span>내가 고른 답</span>
            <strong>{formatChoiceWithText(question.choices, result?.selectedAnswer)}</strong>
          </article>
          <article className="detail-card">
            <span>정답</span>
            <strong>{formatChoiceWithText(question.choices, question.answer)}</strong>
          </article>
        </div>

        {result?.note ? (
          <article className="note-panel">
            <span>내 메모</span>
            <p>{result.note}</p>
          </article>
        ) : null}
      </section>
    </div>
  );
}

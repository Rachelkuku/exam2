"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { formatChoiceWithText } from "@/lib/format";
import {
  appendSubmissionHistory,
  readDraftAnswers,
  readDraftNotes,
  writeDraftAnswers,
  writeDraftNotes,
  writeSubmission,
} from "@/lib/storage";
import type { AnswerMap, Exam, NoteMap } from "@/types/exam";

type ExamSessionProps = {
  exam: Exam;
};

export default function ExamSession({ exam }: ExamSessionProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>(() => readDraftAnswers(exam.examId));
  const [notes, setNotes] = useState<NoteMap>(() => readDraftNotes(exam.examId));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    writeDraftAnswers(exam.examId, answers);
  }, [answers, exam.examId]);

  useEffect(() => {
    writeDraftNotes(exam.examId, notes);
  }, [exam.examId, notes]);

  useEffect(() => {
    if (Object.keys(answers).length === 0 && Object.keys(notes).length === 0) {
      return;
    }

    writeSubmission({
      examId: exam.examId,
      answers,
      notes,
      submittedAt: new Date().toISOString(),
    });
  }, [answers, exam.examId, notes]);

  const currentQuestion = exam.questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const currentNote = notes[currentQuestion.id] ?? "";
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQuestion.answer;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const unansweredCount = exam.questions.length - answeredCount;
  const progress = Math.round((answeredCount / exam.questions.length) * 100);

  function handleSelect(choiceNumber: number) {
    if (isAnswered) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceNumber,
    }));
  }

  function handleSubmit() {
    const submission = {
      examId: exam.examId,
      answers,
      notes,
      submittedAt: new Date().toISOString(),
    };

    writeSubmission(submission);
    appendSubmissionHistory(submission);
    router.push(`/exam/${exam.examId}/result`);
  }

  return (
    <div className="shell">
      <section className="hero hero--compact">
        <div>
          <p className="eyebrow">문제 풀이</p>
          <h1 className="hero__title--exam">{exam.examTitle}</h1>
          <p className="hero__body">
            선택하면 바로 정답 여부가 보입니다. 확인한 뒤 다음 문제로 넘어가면 됩니다.
          </p>
        </div>
        <div className="hero__meta">
          <span>
            {currentIndex + 1} / {exam.questions.length}문제
          </span>
          <span>응답 {answeredCount}개</span>
          <span>미응답 {unansweredCount}개</span>
        </div>
      </section>

      <section className="panel">
        <ProgressBar value={progress} />
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onSelect={handleSelect}
          readOnly={isAnswered}
        />

        <div className="note-box">
          <label className="note-box__label" htmlFor={`note-${currentQuestion.id}`}>
            내 메모
          </label>
          <textarea
            id={`note-${currentQuestion.id}`}
            className="note-box__input"
            value={currentNote}
            onChange={(event) =>
              setNotes((prev) => ({
                ...prev,
                [currentQuestion.id]: event.target.value,
              }))
            }
            placeholder="헷갈린 이유, 개념 정리, 다시 볼 포인트를 적어두세요."
            rows={5}
          />
        </div>

        {isAnswered ? (
          <div className={`submit-box ${isCorrect ? "submit-box--correct" : "submit-box--wrong"}`}>
            <strong>{isCorrect ? "정답입니다." : "오답입니다."}</strong>
            <p>
              내가 고른 답은 {formatChoiceWithText(currentQuestion.choices, selectedAnswer)}이고,
              정답은 {formatChoiceWithText(currentQuestion.choices, currentQuestion.answer)}입니다.
            </p>
          </div>
        ) : (
          <div className="submit-box">
            <strong>답안을 선택하세요.</strong>
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
            <Link className="button button--ghost" href="/">
              회차 목록
            </Link>
            {currentIndex < exam.questions.length - 1 ? (
              <button
                type="button"
                className="button"
                disabled={!isAnswered}
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(prev + 1, exam.questions.length - 1))
                }
              >
                다음 문제
              </button>
            ) : (
              <button
                type="button"
                className="button button--accent"
                disabled={!isAnswered}
                onClick={handleSubmit}
              >
                결과 보기
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

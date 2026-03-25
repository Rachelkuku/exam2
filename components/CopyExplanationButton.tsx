"use client";

import { useEffect, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { buildExplanationPrompt } from "@/lib/format";
import type { Exam, Question } from "@/types/exam";

type CopyExplanationButtonProps = {
  exam: Exam;
  question: Question;
  selectedAnswer?: number;
};

export default function CopyExplanationButton({
  exam,
  question,
  selectedAnswer,
}: CopyExplanationButtonProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  async function handleCopy() {
    try {
      await copyText(buildExplanationPrompt(exam, question, selectedAnswer));
      setToastMessage("해설 요청용 텍스트를 복사했습니다.");
    } catch {
      setToastMessage("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  }

  return (
    <>
      <button type="button" className="button button--accent" onClick={handleCopy}>
        해설 요청용 복사
      </button>
      {toastMessage ? <div className="toast">{toastMessage}</div> : null}
    </>
  );
}

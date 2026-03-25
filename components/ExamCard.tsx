import Link from "next/link";
import type { Exam } from "@/types/exam";

type ExamCardProps = {
  exam: Exam;
};

export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link href={`/exam/${exam.examId}`} className="exam-card">
      <span className="pill">
        {exam.year}년 · 제{exam.round}회
      </span>
      <strong>{exam.examTitle}</strong>
      <p>{exam.questions.length}문항 구성</p>
      <span className="exam-card__cta">문제 풀기</span>
    </Link>
  );
}

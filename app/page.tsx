import Link from "next/link";
import ExamCard from "@/components/ExamCard";
import { getAllExams } from "@/lib/exam";

export default function Home() {
  const exams = getAllExams();

  return (
    <div className="shell">
      <section className="hero">
        <div>
          <h1 className="hero__title--small">전산회계 2급 문제은행</h1>
        </div>
        <div className="hero__meta">
          <span>{exams.length}개 시험</span>
          <span>A형 이론 15문항</span>
          <span>문제별 메모와 오답 복습 지원</span>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">시험 선택</p>
            <h2>풀고 싶은 회차를 고르세요</h2>
          </div>
          <div className="section-heading__actions">
            <Link className="button button--ghost" href="/wrong-notes">
              전체 오답노트
            </Link>
          </div>
        </div>
        <div className="exam-grid">
          {exams.map((exam) => (
            <ExamCard key={exam.examId} exam={exam} />
          ))}
        </div>
      </section>
    </div>
  );
}

type ResultSummaryProps = {
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
};

export default function ResultSummary({
  totalCount,
  correctCount,
  wrongCount,
  unansweredCount,
}: ResultSummaryProps) {
  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span>총 문제 수</span>
        <strong>{totalCount}</strong>
      </article>
      <article className="stat-card">
        <span>맞은 개수</span>
        <strong>{correctCount}</strong>
      </article>
      <article className="stat-card">
        <span>틀린 개수</span>
        <strong>{wrongCount}</strong>
      </article>
      <article className="stat-card">
        <span>미응답</span>
        <strong>{unansweredCount}</strong>
      </article>
    </section>
  );
}

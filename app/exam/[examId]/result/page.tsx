import { notFound } from "next/navigation";
import ResultView from "@/components/ResultView";
import { getAllExams, getExamById } from "@/lib/exam";

export async function generateStaticParams() {
  return getAllExams().map((exam) => ({
    examId: exam.examId,
  }));
}

export default async function ResultPage(props: PageProps<"/exam/[examId]/result">) {
  const { examId } = await props.params;
  const exam = getExamById(examId);

  if (!exam) {
    notFound();
  }

  return <ResultView exam={exam} />;
}

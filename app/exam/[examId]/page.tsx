import { notFound } from "next/navigation";
import ExamSession from "@/components/ExamSession";
import { getAllExams, getExamById } from "@/lib/exam";

export async function generateStaticParams() {
  return getAllExams().map((exam) => ({
    examId: exam.examId,
  }));
}

export default async function ExamPage(props: PageProps<"/exam/[examId]">) {
  const { examId } = await props.params;
  const exam = getExamById(examId);

  if (!exam) {
    notFound();
  }

  return <ExamSession exam={exam} />;
}

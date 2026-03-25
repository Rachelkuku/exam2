import { notFound } from "next/navigation";
import WrongNoteView from "@/components/WrongNoteView";
import { getAllExams, getExamById } from "@/lib/exam";

export async function generateStaticParams() {
  return getAllExams().map((exam) => ({
    examId: exam.examId,
  }));
}

export default async function WrongPage(props: PageProps<"/exam/[examId]/wrong">) {
  const { examId } = await props.params;
  const exam = getExamById(examId);

  if (!exam) {
    notFound();
  }

  return <WrongNoteView exam={exam} />;
}

import { notFound } from "next/navigation";
import QuestionDetailView from "@/components/QuestionDetailView";
import { getAllExams, getExamById, getQuestionById } from "@/lib/exam";

export async function generateStaticParams() {
  return getAllExams().flatMap((exam) =>
    exam.questions.map((question) => ({
      examId: exam.examId,
      questionId: question.id,
    })),
  );
}

export default async function QuestionPage(
  props: PageProps<"/exam/[examId]/question/[questionId]">,
) {
  const { examId, questionId } = await props.params;
  const exam = getExamById(examId);
  const question = getQuestionById(examId, questionId);

  if (!exam || !question) {
    notFound();
  }

  return <QuestionDetailView exam={exam} question={question} />;
}

import AllWrongNotesView from "@/components/AllWrongNotesView";
import { getAllExams } from "@/lib/exam";

export default function WrongNotesPage() {
  return <AllWrongNotesView exams={getAllExams()} />;
}

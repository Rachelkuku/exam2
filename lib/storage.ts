import type { AnswerMap, ExamSubmission, NoteMap } from "@/types/exam";

export function getDraftStorageKey(examId: string) {
  return `accounting-bank:draft:${examId}`;
}

export function getDraftNotesStorageKey(examId: string) {
  return `accounting-bank:draft-notes:${examId}`;
}

export function getSubmissionStorageKey(examId: string) {
  return `accounting-bank:submission:${examId}`;
}

function readJson<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readDraftAnswers(examId: string) {
  return readJson<AnswerMap>(getDraftStorageKey(examId), {});
}

export function writeDraftAnswers(examId: string, answers: AnswerMap) {
  window.localStorage.setItem(getDraftStorageKey(examId), JSON.stringify(answers));
}

export function readDraftNotes(examId: string) {
  return readJson<NoteMap>(getDraftNotesStorageKey(examId), {});
}

export function writeDraftNotes(examId: string, notes: NoteMap) {
  window.localStorage.setItem(getDraftNotesStorageKey(examId), JSON.stringify(notes));
}

export function readSubmission(examId: string) {
  return readJson<ExamSubmission | null>(getSubmissionStorageKey(examId), null);
}

export function readAllSubmissions() {
  if (typeof window === "undefined") {
    return [];
  }

  const submissions: ExamSubmission[] = [];

  for (const key of Object.keys(window.localStorage)) {
    if (!key.startsWith("accounting-bank:submission:")) {
      continue;
    }

    const submission = readJson<ExamSubmission | null>(key, null);

    if (submission) {
      submissions.push(submission);
    }
  }

  return submissions.sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
}

export function writeSubmission(submission: ExamSubmission) {
  window.localStorage.setItem(
    getSubmissionStorageKey(submission.examId),
    JSON.stringify(submission),
  );
}

export function clearExamStorage(examId: string) {
  window.localStorage.removeItem(getDraftStorageKey(examId));
  window.localStorage.removeItem(getDraftNotesStorageKey(examId));
  window.localStorage.removeItem(getSubmissionStorageKey(examId));
}

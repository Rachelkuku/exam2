import type { AnswerMap, ExamSubmission, NoteMap } from "@/types/exam";

const SUBMISSIONS_UPDATED_EVENT = "accounting-bank:submissions-updated";

export function getDraftStorageKey(examId: string) {
  return `accounting-bank:draft:${examId}`;
}

export function getDraftNotesStorageKey(examId: string) {
  return `accounting-bank:draft-notes:${examId}`;
}

export function getSubmissionStorageKey(examId: string) {
  return `accounting-bank:submission:${examId}`;
}

export function getSubmissionHistoryStorageKey(examId: string) {
  return `accounting-bank:submission-history:${examId}`;
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

function notifySubmissionsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SUBMISSIONS_UPDATED_EVENT));
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

export function readSubmissionHistory(examId: string) {
  return readJson<ExamSubmission[]>(getSubmissionHistoryStorageKey(examId), []);
}

export function readAllSubmissions() {
  if (typeof window === "undefined") {
    return [];
  }

  const submissions = new Map<string, ExamSubmission>();

  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("accounting-bank:submission-history:")) {
      const history = readJson<ExamSubmission[]>(key, []);

      for (const submission of history) {
        submissions.set(`${submission.examId}:${submission.submittedAt}`, submission);
      }
      continue;
    }

    if (key.startsWith("accounting-bank:submission:")) {
      const submission = readJson<ExamSubmission | null>(key, null);

      if (submission) {
        submissions.set(`${submission.examId}:${submission.submittedAt}`, submission);
      }
    }
  }

  return [...submissions.values()].sort((left, right) =>
    right.submittedAt.localeCompare(left.submittedAt),
  );
}

export function writeSubmission(submission: ExamSubmission) {
  window.localStorage.setItem(
    getSubmissionStorageKey(submission.examId),
    JSON.stringify(submission),
  );
  notifySubmissionsUpdated();
}

export function appendSubmissionHistory(submission: ExamSubmission) {
  const history = readSubmissionHistory(submission.examId);
  const nextHistory = [...history, submission].sort((left, right) =>
    right.submittedAt.localeCompare(left.submittedAt),
  );

  window.localStorage.setItem(
    getSubmissionHistoryStorageKey(submission.examId),
    JSON.stringify(nextHistory),
  );
  notifySubmissionsUpdated();
}

export function getSubmissionsUpdatedEventName() {
  return SUBMISSIONS_UPDATED_EVENT;
}

export function clearExamStorage(examId: string) {
  window.localStorage.removeItem(getDraftStorageKey(examId));
  window.localStorage.removeItem(getDraftNotesStorageKey(examId));
  window.localStorage.removeItem(getSubmissionStorageKey(examId));
}

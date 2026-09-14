import { questionBanks, hasPractice, type BankQuestion } from './question-bank';

export type QuestionRecord = {
  choice: number | null;
  checked: boolean;
  revealed: boolean;
  helped?: boolean;
  first?: 'correct' | 'wrong' | 'assisted';
  attempts: number;
  wrong: number;
  needsReview: boolean;
};
export type BankProgress = {
  packId: string;
  questionId: string;
  records: Record<string, QuestionRecord>;
};
export type QuizState = {
  activeQuiz?: string | null;
  quizProgress?: Record<string, BankProgress>;
  practiceAnswers?: Record<string, number[]>;
};
export const blankRecord = (): QuestionRecord => ({
  choice: null,
  checked: false,
  revealed: false,
  helped: false,
  attempts: 0,
  wrong: 0,
  needsReview: false,
});

// Legacy answers keep their exact original question mapping. No data is deleted or re-indexed.
export function bankProgress(state: QuizState, topicId: string): BankProgress {
  if (state.quizProgress?.[topicId]) return state.quizProgress[topicId];
  const bank = questionBanks[topicId];
  const records: Record<string, QuestionRecord> = {};
  state.practiceAnswers?.[topicId]?.forEach((choice, i) => {
    const q = bank.questions[i];
    if (!q || choice < 0) return;
    const correct = choice === q.answer;
    records[q.id] = {
      choice,
      checked: true,
      revealed: false,
      first: correct ? 'correct' : 'wrong',
      attempts: 1,
      wrong: correct ? 0 : 1,
      needsReview: !correct,
    };
  });
  const question =
    bank.questions.find((q) => !records[q.id]?.first) || bank.questions[0];
  const pack = bank.packs.find((p) => p.ids.includes(question.id))!;
  return { packId: pack.id, questionId: question.id, records };
}
export function updateBank<T extends QuizState>(
  state: T,
  topicId: string,
  update: (p: BankProgress) => BankProgress,
): T {
  return {
    ...state,
    quizProgress: {
      ...state.quizProgress,
      [topicId]: update(bankProgress(state, topicId)),
    },
  };
}
export function openQuiz<T extends QuizState>(state: T, topicId: string): T {
  return { ...updateBank(state, topicId, (p) => p), activeQuiz: topicId };
}
export function updateQuestion<T extends QuizState>(
  state: T,
  topicId: string,
  id: string,
  update: (r: QuestionRecord, q: BankQuestion) => QuestionRecord,
): T {
  const q = questionBanks[topicId].questions.find((q) => q.id === id)!;
  return updateBank(state, topicId, (p) => ({
    ...p,
    records: { ...p.records, [id]: update(p.records[id] || blankRecord(), q) },
  }));
}
export function checkAnswer(
  record: QuestionRecord,
  q: BankQuestion,
): QuestionRecord {
  if (record.checked || record.choice === null) return record;
  const correct = record.choice === q.answer;
  return {
    ...record,
    checked: true,
    first:
      record.first ||
      (record.helped ? 'assisted' : correct ? 'correct' : 'wrong'),
    attempts: record.attempts + 1,
    wrong: record.wrong + (correct ? 0 : 1),
    needsReview: !correct || !!record.helped,
  };
}
export function revealAnswer(record: QuestionRecord): QuestionRecord {
  return {
    ...record,
    revealed: true,
    helped: !!record.helped || !record.checked,
    first: record.first || 'assisted',
    needsReview: record.needsReview || !record.checked,
  };
}
export function retryQuestion(record: QuestionRecord): QuestionRecord {
  return {
    ...record,
    choice: null,
    checked: false,
    revealed: false,
    helped: false,
  };
}
export function quizStats(p: BankProgress) {
  const records = Object.values(p.records);
  const studied = records.filter((r) => r.first).length;
  const correct = records.filter((r) => r.first === 'correct').length;
  return {
    studied,
    correct,
    wrong: records.filter((r) => r.first === 'wrong').length,
    assisted: records.filter((r) => r.first === 'assisted').length,
    review: records.filter((r) => r.needsReview).length,
    percentage: studied ? Math.round((correct * 100) / studied) : null,
  };
}
export function validateQuiz(s: QuizState) {
  const object = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  if (
    s.activeQuiz !== undefined &&
    s.activeQuiz !== null &&
    (typeof s.activeQuiz !== 'string' || !hasPractice(s.activeQuiz))
  )
    return false;
  if (s.quizProgress === undefined) return !s.activeQuiz;
  if (
    !object(s.quizProgress) ||
    Object.keys(s.quizProgress).length > Object.keys(questionBanks).length
  )
    return false;
  if (s.activeQuiz && !Object.hasOwn(s.quizProgress, s.activeQuiz))
    return false;
  return Object.entries(s.quizProgress).every(([topicId, p]) => {
    if (!hasPractice(topicId) || !object(p) || !object(p.records)) return false;
    const bank = questionBanks[topicId];
    const pack = bank.packs.find((b) => b.id === p.packId);
    if (!pack && p.packId !== 'mistakes') return false;
    if (
      !bank.questions.some((q) => q.id === p.questionId) ||
      (pack && !pack.ids.includes(p.questionId))
    )
      return false;
    if (Object.keys(p.records).length > bank.questions.length) return false;
    return Object.entries(p.records).every(([id, r]) => {
      const q = bank.questions.find((q) => q.id === id);
      if (!q || !object(r)) return false;
      if (
        r.choice !== null &&
        (!Number.isInteger(r.choice) ||
          r.choice < 0 ||
          r.choice >= q.options.length)
      )
        return false;
      if (
        typeof r.checked !== 'boolean' ||
        typeof r.revealed !== 'boolean' ||
        typeof r.needsReview !== 'boolean'
      )
        return false;
      if (r.helped !== undefined && typeof r.helped !== 'boolean') return false;
      if (
        r.first !== undefined &&
        !['correct', 'wrong', 'assisted'].includes(r.first)
      )
        return false;
      if (
        !Number.isInteger(r.attempts) ||
        r.attempts < 0 ||
        r.attempts > 10000 ||
        !Number.isInteger(r.wrong) ||
        r.wrong < 0 ||
        r.wrong > r.attempts
      )
        return false;
      if (r.checked && (r.choice === null || !r.first || r.attempts < 1))
        return false;
      if (r.revealed && !r.first) return false;
      return true;
    });
  });
}

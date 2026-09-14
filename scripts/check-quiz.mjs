import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({
  entryPoints: ['lib/quiz-state.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const quiz = await import(
  'data:text/javascript;base64,' +
    Buffer.from(result.outputFiles[0].text).toString('base64')
);
const load = async (path) => {
  const b = await build({
    entryPoints: [path],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  return import(
    'data:text/javascript;base64,' +
      Buffer.from(b.outputFiles[0].text).toString('base64')
  );
};
const { questionBanks } = await load('lib/question-bank.ts');
const { validateState, emptyState } = await load('lib/study.ts');
const { practice } = await load('lib/practice.ts');
const bank = questionBanks['s0-7'];
assert.deepEqual(
  bank.questions.slice(0, 10).map((q) => q.options[q.answer]),
  ['12', '1', '459', '4', '5', '8', '52', '2', '120', '1'],
);
assert.equal(bank.questions.length, 40);
assert.deepEqual(
  bank.packs.map((p) => p.ids.length),
  [10, 10, 10, 5, 5],
);
for (const b of Object.values(questionBanks)) {
  assert.equal(new Set(b.questions.map((q) => q.id)).size, b.questions.length);
  assert.deepEqual(
    b.packs.flatMap((p) => p.ids),
    b.questions.map((q) => q.id),
  );
  b.questions.forEach((q) => {
    assert.equal(q.options.length, 5);
    assert.equal(new Set(q.options).size, 5);
    assert(q.answer >= 0 && q.answer < 5);
    assert(q.explanation.length > 10);
  });
  practice[b.topicId].forEach((q, i) => {
    assert.deepEqual(b.questions[i].options, q.options);
    assert.equal(b.questions[i].q, q.q);
    assert.equal(b.questions[i].answer, q.answer);
  });
}
const old = {
  ...emptyState(),
  done: { 's0-7:learn-0': '2026-09-13' },
  notes: { 's0-7': 'notumu koru' },
  practiceAnswers: { 's0-7': [2, 1, -1, -1, -1, -1, -1, -1, -1, -1] },
};
let s = quiz.openQuiz(old, 's0-7');
assert(validateState(s));
assert.deepEqual(s.done, old.done);
assert.deepEqual(s.notes, old.notes);
assert.deepEqual(s.practiceAnswers, old.practiceAnswers);
assert.equal(s.quizProgress['s0-7'].questionId, 'bolme-3');
assert.equal(s.quizProgress['s0-7'].records['bolme-1'].first, 'correct');
assert(s.quizProgress['s0-7'].records['bolme-2'].needsReview);
const q = bank.questions[2];
s = quiz.updateQuestion(s, 's0-7', q.id, (r) => ({ ...r, choice: 0 }));
assert(!s.quizProgress['s0-7'].records[q.id].checked);
assert(!s.quizProgress['s0-7'].records[q.id].revealed);
s = quiz.updateQuestion(s, 's0-7', q.id, quiz.checkAnswer);
assert.equal(s.quizProgress['s0-7'].records[q.id].first, 'wrong');
assert.equal(s.quizProgress['s0-7'].records[q.id].wrong, 1);
const checked = s;
s = quiz.updateQuestion(s, 's0-7', q.id, quiz.checkAnswer);
assert.deepEqual(s, checked, 'duplicate checking must be idempotent');
s = quiz.updateQuestion(s, 's0-7', q.id, quiz.revealAnswer);
s = quiz.updateQuestion(s, 's0-7', q.id, quiz.retryQuestion);
assert(!s.quizProgress['s0-7'].records[q.id].revealed);
s = quiz.updateQuestion(s, 's0-7', q.id, (r) => ({ ...r, choice: q.answer }));
s = quiz.updateQuestion(s, 's0-7', q.id, quiz.checkAnswer);
assert.equal(s.quizProgress['s0-7'].records[q.id].first, 'wrong');
assert(!s.quizProgress['s0-7'].records[q.id].needsReview);
assert.equal(s.quizProgress['s0-7'].records[q.id].wrong, 1);
const next = bank.questions[3];
const afterCorrect = quiz.revealAnswer(s.quizProgress['s0-7'].records[q.id]);
assert.equal(
  afterCorrect.helped,
  false,
  'solution after checking must not count as prior help',
);
assert.equal(afterCorrect.needsReview, false);
s = quiz.updateQuestion(s, 's0-7', next.id, quiz.revealAnswer);
assert.equal(s.quizProgress['s0-7'].records[next.id].first, 'assisted');
assert(s.quizProgress['s0-7'].records[next.id].needsReview);
s = quiz.updateQuestion(s, 's0-7', next.id, (r) => ({
  ...r,
  choice: next.answer,
}));
s = quiz.updateQuestion(s, 's0-7', next.id, quiz.checkAnswer);
assert(s.quizProgress['s0-7'].records[next.id].needsReview);
assert.deepEqual(quiz.quizStats(s.quizProgress['s0-7']), {
  studied: 4,
  correct: 1,
  wrong: 2,
  assisted: 1,
  review: 2,
  percentage: 25,
});
assert(validateState(JSON.parse(JSON.stringify(s))));
assert(!validateState({ ...s, activeQuiz: 'unknown' }));
assert(
  !validateState({ ...s, quizProgress: { unknown: s.quizProgress['s0-7'] } }),
);
for (const patch of [
  { choice: 5 },
  { choice: -1 },
  { attempts: -1 },
  { checked: true, choice: null },
  { first: 'fake' },
  { wrong: 99999 },
  { revealed: true, first: undefined },
]) {
  const bad = quiz.updateQuestion(s, 's0-7', next.id, (r) => ({
    ...r,
    ...patch,
  }));
  assert(!validateState(bad), JSON.stringify(patch));
}
assert(
  !validateState({
    ...s,
    quizProgress: {
      's0-7': { ...s.quizProgress['s0-7'], questionId: 'bogus' },
    },
  }),
);
assert(
  validateState({
    ...s,
    quizProgress: { 's0-7': { ...s.quizProgress['s0-7'], packId: 'mistakes' } },
  }),
);
assert.deepEqual(old.quizProgress, undefined, 'legacy source not mutated');
let all = emptyState();
for (const b of Object.values(questionBanks)) {
  all = quiz.openQuiz(all, b.topicId);
  for (const q of b.questions) {
    all = quiz.updateQuestion(all, b.topicId, q.id, (r) => ({
      ...r,
      choice: q.answer,
    }));
    all = quiz.updateQuestion(all, b.topicId, q.id, quiz.checkAnswer);
    assert(validateState(all));
  }
  assert.equal(quiz.quizStats(all.quizProgress[b.topicId]).percentage, 100);
}
assert(JSON.stringify(all).length < 180000);
console.log(
  'Quiz checks passed: 40 + 20 static questions, stable IDs/legacy migration, hidden selection, check/reveal/retry, immutable first score, wrong review, resume and rejected invalid data.',
);

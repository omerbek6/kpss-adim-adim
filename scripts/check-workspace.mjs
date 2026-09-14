import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { build } from 'esbuild';
const load = async (entry, plugins = []) => {
  const b = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    plugins,
  });
  return import(
    'data:text/javascript;base64,' +
      Buffer.from(b.outputFiles[0].text).toString('base64')
  );
};
const c = await load('lib/companion.ts'),
  s = await load('lib/study.ts'),
  quiz = await load('lib/quiz-state.ts'),
  { practice } = await load('lib/practice.ts');
const t = {
  id: 'test-timer',
  day: '2026-09-13',
  stepId: 's0-7:learn-0',
  label: 'Bölme',
  duration: 1500,
  remaining: 1500,
  startedAt: 1000000,
};
const saved = c.saveTimer({ ...s.emptyState(), timer: t }, 1030000);
assert.equal(saved.timer, null);
assert.equal(saved.focusSessions[t.id].seconds, 30);
assert.deepEqual(c.saveTimer(saved, 1035000), saved);
assert.equal(
  c.saveTimer({ ...s.emptyState(), timer: { ...t, kind: 'break' } }, 1030000)
    .focusSessions,
  undefined,
);
const extended = c.extendTimer(t, 600, 1030000);
assert.equal(extended.duration, 2100);
assert.equal(c.timerRemaining(extended, 1030000), 2070);
assert.equal(extended.duration - c.timerRemaining(extended, 1030000), 30);
assert.equal(
  c.extendTimer({ ...t, duration: 10700, remaining: 10700 }, 600, 1000000)
    .duration,
  10800,
);
assert.equal(
  c.timerRemaining({ ...t, remaining: 1100, startedAt: null }, 9990000),
  1100,
);
for (const duration of [60, 600, 1500, 2700, 10800])
  assert(
    s.validateState({
      ...s.emptyState(),
      timer: { ...t, duration, remaining: duration },
    }),
  );
assert(
  !s.validateState({
    ...s.emptyState(),
    timer: { ...t, duration: 10801, remaining: 0 },
  }),
);
assert(
  s.validateState({
    ...saved,
    videoPositions: { 's0-7': 125 },
    practiceAnswers: { 's0-7': Array(10).fill(-1) },
  }),
);
assert(!s.validateState({ ...saved, videoPositions: { bad: 10 } }));
assert(!s.validateState({ ...saved, practiceAnswers: { 's0-7': [7] } }));
for (const questions of Object.values(practice)) {
  assert.equal(questions.length, 10);
  for (const q of questions) {
    assert.equal(q.options.length, 5);
    assert.equal(new Set(q.options).size, 5);
    assert(q.answer >= 0 && q.answer < 5 && q.explanation.length > 0);
  }
}
const db = new DatabaseSync(':memory:');
db.exec(await readFile('drizzle/0000_freezing_agent_zero.sql', 'utf8'));
db.exec(await readFile('drizzle/0001_zippy_grim_reaper.sql', 'utf8'));
const legacy = { ...s.emptyState(), done: { 's0-7:learn-0': '2026-09-12' } };
db.prepare('INSERT INTO study_state(id,data,revision) VALUES(1,?,7)').run(
  JSON.stringify(legacy),
);
globalThis.__studyTestEnv = {
  LEGACY_OWNER_EMAIL: 'owner@example.test',
  DB: {
    prepare(sql) {
      const stmt = db.prepare(sql);
      let values = [];
      return {
        bind(...args) {
          values = args;
          return this;
        },
        async first() {
          return stmt.get(...values);
        },
        async run() {
          const result = stmt.run(...values);
          return { meta: { changes: Number(result.changes) } };
        },
      };
    },
  },
};
const route = await load('app/api/study/route.ts', [
  {
    name: 'test-cloudflare',
    setup(b) {
      b.onResolve({ filter: /^cloudflare:workers$/ }, () => ({
        path: 'env',
        namespace: 'test',
      }));
      b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
        contents: 'export const env = globalThis.__studyTestEnv;',
      }));
    },
  },
]);
const request = (id, email, method = 'GET', body, extra = {}) =>
  new Request('https://study.example/api/study', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(id
        ? {
            'oai-authenticated-user-id': id,
            'oai-authenticated-user-email': email,
          }
        : {}),
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
assert.equal((await route.GET(request())).status, 401);
const owner = await (
  await route.GET(request('owner', 'owner@example.test'))
).json();
assert.deepEqual(owner.state, legacy);
assert.equal(owner.revision, 7);
const partner = await (
  await route.GET(request('partner', 'partner@example.test'))
).json();
assert.deepEqual(partner.state, s.emptyState());
assert.equal(partner.revision, 0);
const updated = quiz.updateQuestion(
  quiz.openQuiz(
    { ...partner.state, notes: { 's0-7': 'Partner notu' } },
    's0-7',
  ),
  's0-7',
  'bolme-1',
  (r) => ({ ...r, choice: 0 }),
);
assert.equal(
  (
    await route.PUT(
      request('partner', 'partner@example.test', 'PUT', {
        state: updated,
        revision: 0,
      }),
    )
  ).status,
  200,
);
assert.equal(
  (
    await route.PUT(
      request('partner', 'partner@example.test', 'PUT', {
        state: updated,
        revision: 0,
      }),
    )
  ).status,
  409,
);
assert.equal(
  (
    await route.PUT(
      request(
        'partner',
        'partner@example.test',
        'PUT',
        { state: updated, revision: 1 },
        { Origin: 'https://other.example' },
      ),
    )
  ).status,
  403,
);
assert.equal(
  (
    await route.PUT(
      request(undefined, undefined, 'PUT', { state: updated, revision: 1 }),
    )
  ).status,
  401,
);
assert.equal(
  (
    await route.PUT(
      request('partner', 'partner@example.test', 'PUT', {
        state: { done: 'bad' },
        revision: 1,
      }),
    )
  ).status,
  400,
);
assert.deepEqual(
  (await (await route.GET(request('owner', 'owner@example.test'))).json())
    .state,
  legacy,
);
assert.deepEqual(
  JSON.parse(db.prepare('SELECT data FROM study_state WHERE id=1').get().data),
  legacy,
);
assert.equal(
  (await (await route.GET(request('partner', 'partner@example.test'))).json())
    .state.notes['s0-7'],
  'Partner notu',
);
db.close();
delete globalThis.__studyTestEnv;
console.log(
  'Workspace checks passed: reset/save/extend/break, duration bounds, saved bookmarks/quiz, 30 questions, owner migration, isolated accounts, auth, stale writes and cross-origin rejection.',
);

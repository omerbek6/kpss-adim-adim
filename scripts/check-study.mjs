import assert from 'node:assert/strict';
import { build } from 'esbuild';
const bundled = await build({
  entryPoints: ['lib/study.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});
const m = await import(
  'data:text/javascript;base64,' +
    Buffer.from(bundled.outputFiles[0].text).toString('base64')
);
assert.equal(
  m.topics.reduce((n, t) => n + t.book.length, 0),
  243,
);
assert.equal(
  new Set(m.topics.flatMap((t) => t.book.map((b) => t.subject + ':' + b.no)))
    .size,
  243,
);
assert(
  m.topics.every(
    (t) => t.high >= t.low && m.topicSteps(t, m.emptyState()).length > 0,
  ),
);
let state = m.withToday(m.emptyState(), '2026-09-08');
assert.equal(state.plans['2026-09-08'].focus, 's0-7');
assert.equal(
  m.daySteps(state, '2026-09-08').reduce((n, s) => n + s.minutes, 0),
  50,
);
assert.equal(m.daySteps(state, '2026-09-08')[0].id, 's0-7:learn-0');
const short = m.makePlan(state, '2026-09-08', 25);
assert.deepEqual(short.ids, ['s0-7:learn-0']);
state.done['s0-7:learn-0'] = '2026-09-08';
state = m.withToday(state, '2026-09-20');
assert.equal(Object.keys(state.plans).length, 2);
const continuation = m.makePlan(state, '2026-09-20', 50, 's0-7');
assert.equal(continuation.ids[0], 's0-7:practice-0');
assert(!continuation.ids.includes('s0-7:learn-0'));
assert.equal(m.makePlan(m.emptyState(), '2026-09-28').mode, 150);
assert.equal(m.makePlan(m.emptyState(), '2026-10-01').mode, 200);
assert(m.validateState(state));
assert(!m.validateState({ ...state, done: { invalid: '2026-09-08' } }));
assert(!m.validateState({ ...state, extra: { 's0-7': 21 } }));
assert(!m.validateState({ ...state, plans: { '2026-09-08': null } }));
const finished = m.emptyState(),
  topic = m.topics.find((t) => t.id === 's0-7');
for (const step of m.topicSteps(topic, finished))
  finished.done[step.id] = '2026-09-08';
assert(m.completed(topic, finished));
finished.extra[topic.id] = 1;
assert(!m.completed(topic, finished));
console.log(
  'Study checks passed: topic coverage, budgets, continuation, completion, input validation.',
);

if (process.argv.includes('--api')) {
  const endpoint = 'http://localhost:3000/api/study';
  const read = await fetch(endpoint);
  assert.equal(read.status, 200);
  const initial = await read.json();
  const put = (payload, headers = {}) =>
    fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
  const edited = { ...initial.state, application: !initial.state.application };
  const saved = await put({ state: edited, revision: initial.revision });
  assert.equal(saved.status, 200);
  const result = await saved.json();
  try {
    assert.deepEqual((await (await fetch(endpoint)).json()).state, edited);
    assert.equal(
      (await put({ state: initial.state, revision: initial.revision })).status,
      409,
    );
    assert.equal(
      (
        await put({
          state: { ...edited, done: { invalid: '2026-09-08' } },
          revision: result.revision,
        })
      ).status,
      400,
    );
    assert.equal((await put(null)).status, 400);
    assert.equal(
      (
        await put(
          { state: edited, revision: result.revision },
          { Origin: 'https://unrelated.example' },
        )
      ).status,
      403,
    );
  } finally {
    assert.equal(
      (await put({ state: initial.state, revision: result.revision })).status,
      200,
    );
  }
  console.log(
    'Local persistence checks passed: save, reload, stale-edit protection, malformed/cross-origin rejection; initial data restored.',
  );
}

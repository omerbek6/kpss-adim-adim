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
assert.equal(m.makePlan(m.emptyState(), '2026-09-28').mode, 240);
assert.equal(m.makePlan(m.emptyState(), '2026-10-01').mode, 360);
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

const today = '2026-09-08';
const initialMixed = m.withToday(m.emptyState(), today);
assert.equal(initialMixed.plans[today].kind, 'mixed');
assert.deepEqual(
  m
    .daySteps(initialMixed, today)
    .map((s) => m.topics.find((t) => t.id === s.topicId).subject),
  ['Matematik', 'Türkçe'],
);
for (const mode of [25, 50, 100, 240, 360]) {
  const s = m.emptyState();
  s.plans[today] = m.makeBalancedPlan(s, today, mode);
  assert(m.validateState(s));
  assert(m.daySteps(s, today).reduce((n, s) => n + s.minutes, 0) <= mode);
  assert.equal(new Set(s.plans[today].ids).size, s.plans[today].ids.length);
  const first = m.daySteps(s, today)[0];
  s.done[first.id] = today;
  const before = structuredClone(s.done);
  s.plans[today] = m.makeBalancedPlan(s, today, 25);
  assert.deepEqual(s.done, before);
  assert(s.plans[today].ids.includes(first.id));
}
const legacy = {
  ...m.emptyState(),
  application: true,
  done: { 's0-7:learn-0': today },
  plans: {
    [today]: {
      mode: 50,
      focus: 's0-7',
      ids: ['s0-7:learn-0', 's0-7:practice-0', `paragraph:${today}`],
    },
  },
};
const upgraded = m.withToday(legacy, today);
assert.deepEqual(upgraded.done, legacy.done);
assert(upgraded.application);
assert.equal(upgraded.plans[today].version, 2);
assert(m.validateState(upgraded));
assert.equal(m.withToday(upgraded, today), upgraded);
let cycle = m.emptyState();
for (let i = 0; i < 6; i++) {
  const day = `2026-09-${String(8 + i * 2).padStart(2, '0')}`;
  assert.equal(m.studiedDayCount(cycle, day), i);
  assert.deepEqual(
    m.programSlots(cycle, day, 50).map((x) => x.subject),
    m.workRotation[i],
  );
  cycle = m.withToday(cycle, day);
  cycle.done[cycle.plans[day].ids[0]] = day;
}
const spaced = m.emptyState();
for (const st of m.topicSteps(topic, spaced)) spaced.done[st.id] = today;
spaced.plans['2026-09-09'] = m.makeBalancedPlan(spaced, '2026-09-09', 100);
assert(spaced.plans['2026-09-09'].ids.includes('spaced:s0-7:1'));
spaced.done['spaced:s0-7:1'] = '2026-09-09';
spaced.plans['2026-09-10'] = m.makeBalancedPlan(spaced, '2026-09-10', 100);
assert(!spaced.plans['2026-09-10'].ids.includes('spaced:s0-7:3'));
spaced.plans['2026-09-11'] = m.makeBalancedPlan(spaced, '2026-09-11', 100);
assert(spaced.plans['2026-09-11'].ids.includes('spaced:s0-7:3'));
assert(m.validateState(spaced));
const mock = m.emptyState();
mock.plans[today] = m.makeExamPlan(mock, today);
assert.equal(
  m.daySteps(mock, today).reduce((n, s) => n + s.minutes, 0),
  170,
);
assert(m.validateState(mock));
mock.plans[today] = m.makeBalancedPlan(mock, today);
assert.equal(mock.plans[today].mode, 50);
assert(m.validateState(mock));
const last = m.withToday(m.emptyState(), '2026-10-24');
assert.equal(m.daySteps(last, '2026-10-24').length, 4);
assert(m.daySteps(last, '2026-10-24').every((s) => s.kind === 'review'));
assert(m.validateState(last));
console.log(
  'Mixed program checks passed: subject rotation, budgets, legacy migration, tick preservation, spaced review, exam day and final review.',
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
  const edited = m.withToday(
    { ...initial.state, application: !initial.state.application },
    today,
  );
  edited.plans[today] = m.makeBalancedPlan(edited, today, 100);
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

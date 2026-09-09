import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build } from 'esbuild';
const load = async (path) => {
  const b = await build({
    entryPoints: [path],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
  });
  return import(
    'data:text/javascript;base64,' +
      Buffer.from(b.outputFiles[0].text).toString('base64')
  );
};
const c = await load('lib/companion.ts');
const m = await load('lib/study.ts');
const t = {
  id: 'timer-test',
  day: '2026-09-09',
  stepId: 's0-7:learn-0',
  label: 'Bölme çalışması',
  duration: 1500,
  remaining: 1500,
  startedAt: 1000000,
};
assert.equal(c.timerRemaining(t, 1030000), 1470);
assert.equal(
  c.timerRemaining({ ...t, remaining: 800, startedAt: null }, 9999999),
  800,
);
assert.equal(c.timerRemaining(t, 9000000), 0);
assert.equal(c.timerRemaining(t, 900000), 1500);
const exam = {
  id: 'exam-test',
  day: '2026-09-09',
  name: 'Kontrol denemesi',
  scores: c.examSections.map((s) => ({ right: s.count - 4, wrong: 4 })),
  note: 'İşlem hatalarını tekrar et.',
};
assert.equal(c.examNet(exam), 90);
const enriched = {
  ...m.emptyState(),
  timer: t,
  focusSessions: {
    'session-test': { day: '2026-09-09', seconds: 600, label: 'Çalışma' },
  },
  exams: [exam],
  notes: { 's0-7': 'Örnekleri yeniden çöz.' },
  favorites: ['s0-7'],
};
assert(m.validateState(enriched));
assert(m.validateState(m.emptyState()));
assert.equal(c.weekMinutes(enriched, '2026-09-09').at(-1).minutes, 10);
assert(!m.validateState({ ...enriched, timer: { ...t, remaining: 1501 } }));
assert(!m.validateState({ ...enriched, notes: { 's0-7': 'x'.repeat(601) } }));
assert(!m.validateState({ ...enriched, exams: [exam, exam] }));
assert(
  !m.validateState({ ...enriched, exams: [{ ...exam, day: '2026-02-31' }] }),
);
assert(
  !m.validateState({
    ...enriched,
    exams: [
      { ...exam, scores: [{ right: 31, wrong: 0 }, ...exam.scores.slice(1)] },
    ],
  }),
);
assert(!m.validateState({ ...enriched, favorites: ['invalid'] }));
const manifest = JSON.parse(
  await readFile('public/manifest.webmanifest', 'utf8'),
);
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.start_url, '/');
assert.equal(manifest.scope, '/');
for (const icon of manifest.icons) {
  const b = await readFile('public' + icon.src);
  assert.equal(b.toString('ascii', 1, 4), 'PNG');
  assert.equal(b.readUInt32BE(16), Number(icon.sizes.split('x')[0]));
}
const apple = await readFile('public/icons/apple-touch-icon.png');
assert.equal(apple.readUInt32BE(16), 180);
const html = await readFile('public/offline.html', 'utf8');
assert(html.includes('data-offline-screen="adim-adim-public-message-v1"'));
const events = {},
  cached = [];
let fetchMode = 'offline';
const context = {
  self: {
    addEventListener: (type, fn) => (events[type] = fn),
    clients: { claim: async () => {} },
    skipWaiting: () => {},
  },
  caches: {
    open: async () => ({
      put: async (key) => cached.push(key),
      match: async () => new Response(html),
    }),
    keys: async () => [],
    delete: async () => {},
  },
  fetch: async () => {
    if (fetchMode === 'offline')
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    if (fetchMode === 'login')
      return new Response('<html>private login</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
    throw new Error('offline');
  },
  Response,
};
vm.runInNewContext(await readFile('public/sw.js', 'utf8'), context);
let promise;
events.install({ waitUntil: (p) => (promise = p) });
await promise;
assert.deepEqual(cached, ['/offline.html']);
fetchMode = 'login';
events.install({ waitUntil: (p) => (promise = p) });
await promise;
assert.equal(cached.length, 1);
let intercepted = false;
events.fetch({
  request: { method: 'GET', mode: 'cors', url: '/api/study' },
  respondWith: () => (intercepted = true),
});
assert(!intercepted);
fetchMode = 'fail';
events.fetch({
  request: { method: 'GET', mode: 'navigate' },
  respondWith: (p) => (promise = p),
});
const fallback = await promise;
assert((await fallback.text()).includes('Bağlantı gelince devam'));
console.log(
  'Companion checks passed: timer arithmetic, legacy/enriched validation, net totals, PNG/manifest, offline-only cache and API exclusion.',
);
if (process.argv.includes('--api')) {
  const endpoint = 'http://localhost:3000/api/study';
  const before = await (await fetch(endpoint)).json();
  const initial = structuredClone(before.state);
  const payload = {
    ...before.state,
    timer: t,
    focusSessions: {
      ...before.state.focusSessions,
      'session-test': enriched.focusSessions['session-test'],
    },
    exams: [
      ...(before.state.exams || []).filter((e) => e.id !== exam.id),
      exam,
    ],
    notes: { ...before.state.notes, 's0-7': 'Kontrol notu' },
    favorites: [...new Set([...(before.state.favorites || []), 's0-7'])],
  };
  const put = (state, revision) =>
    fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, revision }),
    });
  const saved = await put(payload, before.revision);
  assert.equal(saved.status, 200);
  const savedData = await saved.json();
  try {
    const read = await (await fetch(endpoint)).json();
    assert.deepEqual(read.state, payload);
    assert.equal((await put(initial, before.revision)).status, 409);
  } finally {
    assert.equal((await put(initial, savedData.revision)).status, 200);
  }
  const manifestResponse = await fetch(
    'http://localhost:3000/manifest.webmanifest',
  );
  assert.equal(manifestResponse.status, 200);
  assert(manifestResponse.headers.get('Content-Type').includes('manifest'));
  const page = await (await fetch('http://localhost:3000/')).text();
  assert(/rel="manifest"[^>]*crossorigin="use-credentials"/.test(page));
  assert(page.includes('/icons/apple-touch-icon.png'));
  console.log(
    'Local API and metadata checks passed; original local study record restored.',
  );
}

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Arithmetic verification of the 30 additions, independent from explanation text.
const items = JSON.parse(
  readFileSync(
    new URL('../lib/questions/division.json', import.meta.url),
    'utf8',
  ),
);
const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);
const sum = (values) => values.reduce((total, value) => total + value, 0);
const digits = (value) => [...String(value)].map(Number);
const only = (values) => {
  assert.equal(
    values.length,
    1,
    `Expected exactly one value: ${JSON.stringify(values)}`,
  );
  return values[0];
};
const unique = (values) => [...new Set(values)];
const expected = new Map();
const put = (id, value) => expected.set(`bolme-${id}`, value);

put(11, Math.max(...range(0, 200).filter((n) => Math.floor(n / 9) === 14)));
put(
  12,
  only(
    range(3, 158).filter((b) => Math.floor(158 / b) === 12 && 158 % b === 2),
  ),
);
put(
  13,
  only(
    range(0, 9).filter(
      (a) => (506 + 10 * a) % 2 === 0 && (506 + 10 * a) % 9 === 0,
    ),
  ),
);
put(14, range(0, 9).filter((b) => (302 + 10 * b) % 8 === 0).length);
put(15, only([105, 115, 135, 150, 125].filter((n) => n % 6 === 0)));
put(16, only(range(0, 9).filter((a) => (403 + 10 * a) % 11 === 0)));
put(17, range(72, 108).filter((n) => n % 4 === 0 && n % 9 === 0).length);
put(
  18,
  only(range(0, 100).filter((n) => Math.floor(n / 7) === 9 && n % 7 === 3)) % 5,
);
put(19, Math.floor(99 / 8) + (99 % 8));
// All residue classes of k needed for the target modulus are represented.
put(20, only(unique(range(0, 11).map((k) => (3 * (12 * k + 8) + 5) % 12))));
put(
  21,
  Math.max(
    ...range(3000, 3999).filter(
      (n) => digits(n)[2] === 4 && n % 5 === 0 && n % 9 === 0,
    ),
  ),
);
put(
  22,
  Math.min(
    ...range(24000, 24999).filter(
      (n) => digits(n)[3] === 6 && n % 4 === 0 && n % 9 === 0,
    ),
  ),
);
put(
  23,
  only(
    unique(
      range(0, 6).flatMap((m) =>
        range(0, 6).map((n) => (2 * (7 * m + 3) + 3 * (7 * n + 5)) % 7),
      ),
    ),
  ),
);
put(24, only(unique(range(0, 8).map((k) => (3 * (6 * k + 4) - 5) % 9))));
put(25, Math.min(...range(100, 999).filter((n) => n % 8 === 5 && n % 3 === 2)));
put(26, Math.max(...range(10, 99).filter((n) => n % 5 === 4 && n % 7 === 6)));
put(27, range(100, 250).filter((n) => n % 6 === 0 && n % 9 !== 0).length);
put(
  28,
  range(0, 9)
    .map((a) => 502 + 10 * a)
    .filter((n) => n % 4 === 0 && new Set(digits(n)).size === 3).length,
);
put(
  29,
  range(6000, 6999).filter(
    (n) => digits(n)[2] === 3 && n % 5 === 0 && n % 11 === 0,
  ).length,
);
put(
  30,
  only(
    range(400, 499)
      .filter((n) => n % 8 === 0 && sum(digits(n).slice(1)) === 9)
      .map((n) => digits(n)[1] * digits(n)[2]),
  ),
);
// For #31: r <= 10 and q = 3r imply A <= 340; scanning through 500 is exhaustive.
put(
  31,
  sum(
    range(1, 500).filter(
      (n) => Math.floor(n / 11) === 3 * (n % 11) && n % 5 === 0,
    ),
  ),
);
put(
  32,
  only(
    unique(
      range(0, 8).map((k) => {
        const a = 18 * k + 13;
        return (a % 6) + ((3 * a + 2) % 9);
      }),
    ),
  ),
);
put(
  33,
  range(100, 999).filter(
    (n) => n % 10 === 0 && n % 4 === 0 && sum(digits(n)) === 12,
  ).length,
);
put(34, range(1, 180).filter((n) => n % 5 === 0 || n % 6 === 0).length);
put(35, sum(range(0, 11).filter((r) => (12 * 17 + r) % 5 === 4)));
const numbers36 = range(20000, 29999).filter((n) => {
  const d = digits(n);
  return d[2] === 3 && d[4] === 4 && d[1] !== d[3] && n % 72 === 0;
});
put(36, Math.max(...numbers36) - Math.min(...numbers36));
const numbers37 = range(100, 999).filter(
  (n) => n % 8 === 5 && n % 9 === 7 && n % 5 === 2,
);
put(37, sum(numbers37));
const numbers38 = range(20000, 29999).filter((n) => {
  const d = digits(n);
  return (
    d[2] === 4 &&
    d[4] === 6 &&
    new Set(d).size === 5 &&
    n % 3 === 0 &&
    n % 11 === 0
  );
});
put(38, numbers38.length);
put(
  39,
  range(1, 500).filter((n) => n % 6 === 0 && n % 4 !== 0 && n % 9 !== 0).length,
);
// For #40: q + r = 31 implies A = 372 - 11r <= 372.
const numbers40 = range(0, 500).filter(
  (n) => Math.floor(n / 12) + (n % 12) === 31 && n % 7 === 0,
);
put(40, sum(numbers40));

assert.equal(items.length, 30);
assert.equal(new Set(items.map((item) => item.id)).size, 30);
const distribution = [0, 0, 0, 0, 0];
for (const [index, item] of items.entries()) {
  const id = index + 11;
  assert.equal(item.id, `bolme-${id}`);
  assert.equal(item.level, id <= 20 ? 'temel' : id <= 35 ? 'sinav' : 'zor');
  assert.equal(typeof item.q, 'string');
  assert.equal(typeof item.explanation, 'string');
  assert.equal(typeof item.skill, 'string');
  assert.ok(item.explanation.length > 80);
  assert.equal(item.options.length, 5);
  assert.equal(new Set(item.options).size, 5);
  assert.ok(item.options.every((option) => typeof option === 'string'));
  assert.ok(
    Number.isInteger(item.answer) && item.answer >= 0 && item.answer <= 4,
  );
  assert.equal(
    Number(item.options[item.answer]),
    expected.get(item.id),
    `${item.id}: wrong keyed answer`,
  );
  assert.equal(
    item.options.filter((option) => Number(option) === expected.get(item.id))
      .length,
    1,
    `${item.id}: answer is not unique`,
  );
  distribution[item.answer] += 1;
}

console.log(
  JSON.stringify(
    {
      status: 'PASS',
      questions: items.length,
      levels: { temel: 10, sinav: 15, zor: 5 },
      answerDistribution: distribution,
      hardQuestionCandidates: {
        'bolme-36': numbers36,
        'bolme-37': numbers37,
        'bolme-38': numbers38,
        'bolme-40': numbers40,
      },
      verifiedAnswers: Object.fromEntries(expected),
    },
    null,
    2,
  ),
);

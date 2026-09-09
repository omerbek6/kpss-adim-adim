import catalog from './topics.json';
import { validateCompanion, type CompanionState } from './companion';

export type Topic = (typeof catalog)[number];
export const topics: Topic[] = catalog;
export const subjects = [
  'Matematik',
  'Türkçe',
  'Tarih',
  'Coğrafya',
  'Vatandaşlık',
  'Geometri',
];
export const examDate = '2026-10-25';
export const workEnd = '2026-09-27';
export type Step = {
  id: string;
  topicId: string;
  title: string;
  detail: string;
  minutes: number;
  kind: 'learn' | 'practice' | 'check' | 'review' | 'paragraph';
};
export type DayPlan = {
  mode: number;
  focus: string;
  ids: string[];
  kind?: 'mixed' | 'focus' | 'exam';
  version?: 2;
};
export type StudyState = CompanionState & {
  done: Record<string, string>;
  plans: Record<string, DayPlan>;
  extra: Record<string, number>;
  application: boolean;
};
export const emptyState = (): StudyState => ({
  done: {},
  plans: {},
  extra: {},
  application: false,
});
export const teachers: Record<string, { name: string; url: string }> = {
  Matematik: {
    name: 'Şenol Hoca',
    url: 'https://www.youtube.com/playlist?list=PL5kIOunpmSBO_M_fUe9fHP1NFPCZRkrw1',
  },
  Türkçe: {
    name: 'Kadir Gümüş',
    url: 'https://www.youtube.com/playlist?list=PL5kIOunpmSBMBPYmrPkd0JikOPIfQW-Sn',
  },
  Tarih: {
    name: 'Sadettin Akyayla',
    url: 'https://www.youtube.com/playlist?list=PLCLfupK6Ie8VLI5KJPnz2mG1pH-uBgo05',
  },
  Coğrafya: {
    name: 'Coğrafyanın Kodları',
    url: 'https://www.youtube.com/@cografyaninkodlari',
  },
  Vatandaşlık: {
    name: 'Erdal Kesekler',
    url: 'https://www.youtube.com/watch?v=V9VGfnQbclI',
  },
  Geometri: {
    name: 'Mehmet Bilge Yıldız',
    url: 'https://www.youtube.com/playlist?list=PL8xiaE-wCWlY1jIb_20i4tu0NjHHGjRZm',
  },
};
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function formatMinutes(n: number) {
  return n < 60
    ? `${n} dk`
    : Number.isInteger(n / 60)
      ? `${n / 60} saat`
      : `${Math.floor(n / 60)} sa ${n % 60} dk`;
}
export function rangeLabel(t: Topic) {
  return `${formatMinutes(t.low)} – ${formatMinutes(t.high)}`;
}
export function firstStepDetail(t: Topic, index: number) {
  if (t.id === 's0-7')
    return (
      [
        'Bölünen, bölen, bölüm ve kalan ilişkisini öğren. İki örneği kendin dene.',
        '2, 3, 4, 5 ve 6 ile bölünebilme kurallarını örneklerle çalış.',
        '8, 9, 10 ve 11 ile bölünebilme; kalanlı soruları çalış.',
      ][index] || 'Yalnız takıldığın kurala dön; yeni iki örnek dene.'
    );
  if (t.previous)
    return 'Daha önce baktığın konu. Önce birkaç örneği dene; hatırlamadığın kısmın anlatımına dön.';
  const part = t.book[Math.min(index, t.book.length - 1)];
  return `${part.label} başlığından kaldığın yerden devam et. Video veya Pegem anlatımını 25 dakikada durdur; 3 kısa not al.`;
}
export function topicSteps(t: Topic, state: StudyState): Step[] {
  if (t.practice)
    return t.book.flatMap((b, i) => [
      {
        id: `${t.id}:practice-${i}`,
        topicId: t.id,
        title: b.label,
        detail:
          'Bu bölüm yeni konu değil, soru çalışması. 25 dakika ayır. Test bitmezse kaldığın yerden sürdür; bitince tikle.',
        minutes: 25,
        kind: 'practice' as const,
      },
      {
        id: `${t.id}:review-${i}`,
        topicId: t.id,
        title: 'Bu testin yanlışlarını inceledim',
        detail: 'Çözümü kapatıp yanlış yaptığın üç soruyu yeniden çöz.',
        minutes: 15,
        kind: 'review' as const,
      },
    ]);
  const rounds = Math.max(1, Math.ceil((t.low - 25) / 40));
  const steps: Step[] = [];
  for (let i = 0; i < rounds; i++) {
    steps.push({
      id: `${t.id}:learn-${i}`,
      topicId: t.id,
      title: `Konuyu çalış${rounds > 1 ? ` · ${i + 1}. parça` : ''}`,
      detail: firstStepDetail(t, i),
      minutes: 25,
      kind: 'learn',
    });
    steps.push({
      id: `${t.id}:practice-${i}`,
      topicId: t.id,
      title: '5–10 soru dene',
      detail:
        'Pegem’den yalnızca çalıştığın bölümün sorularını çöz. 15 dakika dolunca dur; soru sayısını yetiştirmek zorunda değilsin.',
      minutes: 15,
      kind: 'practice',
    });
  }
  for (let i = 0; i < (state.extra[t.id] || 0); i++)
    steps.push({
      id: `${t.id}:extra-${i}`,
      topicId: t.id,
      title: 'Takıldığın yere 25 dakika ayır',
      detail:
        'Tek bir kuralı veya soru tipini seç. Çözümü izle, kapat ve benzer iki soru dene.',
      minutes: 25,
      kind: 'learn',
    });
  steps.push({
    id: `${t.id}:review`,
    topicId: t.id,
    title: 'Yanlışlarına geri dön',
    detail: 'İşaretlediğin sorulardan üçünü çözümü kapatarak yeniden çöz.',
    minutes: 10,
    kind: 'review',
  });
  steps.push({
    id: `${t.id}:check`,
    topicId: t.id,
    title: '10 soruda en az 7 doğru yaptım',
    detail:
      'Daha önce çözmediğin 10 kolay–orta soruyu yardım almadan dene. Bu tiki yalnızca en az 7 doğruysa koy. Bu, sonraki konuya geçmek için çalışma ölçütümüz.',
    minutes: 15,
    kind: 'check',
  });
  return steps;
}
export function allSteps(state: StudyState) {
  return topics.flatMap((t) => topicSteps(t, state));
}
export function completed(t: Topic, state: StudyState) {
  return topicSteps(t, state).every((s) => Boolean(state.done[s.id]));
}
export function nextTopic(state: StudyState, subject = 'Matematik') {
  return (
    topics.find(
      (t) =>
        t.subject === subject &&
        !t.practice &&
        !t.previous &&
        !completed(t, state),
    ) ||
    topics.find(
      (t) => t.subject === subject && !t.practice && !completed(t, state),
    ) ||
    topics.find((t) => !t.practice && !t.previous && !completed(t, state)) ||
    topics[0]
  );
}
export function daySteps(state: StudyState, day: string): Step[] {
  const map = new Map(allSteps(state).map((s) => [s.id, s]));
  const p = state.plans[day];
  if (!p) return [];
  return p.ids.flatMap((id) => {
    const custom = customStep(id, state);
    if (custom) return [custom];
    if (id === `paragraph:${day}`)
      return [
        {
          id,
          topicId: '',
          title: '5 paragraf sorusu çöz',
          detail:
            'Pegem’den paragraf çöz. 10 dakika dolunca bırakabilirsin; önce doğru anlamaya odaklan.',
          minutes: 10,
          kind: 'paragraph',
        } as Step,
      ];
    if (id.startsWith('recall:')) {
      const tid = id.split(':')[1];
      const t = topics.find((t) => t.id === tid);
      return t
        ? [
            {
              id,
              topicId: tid,
              title: `Kısaca hatırla: ${t.name}`,
              detail:
                'Notlarını kapat, üç bilgiyi hatırla; sonra iki eski yanlışını yeniden dene.',
              minutes: 10,
              kind: 'review',
            } as Step,
          ]
        : [];
    }
    const step = map.get(id);
    return step ? [step] : [];
  });
}
export function makeFocusedPlan(
  state: StudyState,
  day: string,
  mode?: number,
  focus?: string,
): DayPlan {
  const old = state.plans[day];
  const limit =
    mode ??
    old?.mode ??
    (day <= workEnd ? 50 : day <= '2026-09-30' ? 150 : 200);
  const studiedDays = Object.entries(state.plans).filter(
    ([key, p]) => key < day && p.ids.some((id) => state.done[id]),
  ).length;
  const rotation = [
    'Matematik',
    'Türkçe',
    'Matematik',
    'Tarih',
    'Matematik',
    'Coğrafya',
    'Matematik',
    'Vatandaşlık',
  ];
  const tid =
    focus ??
    old?.focus ??
    nextTopic(state, rotation[studiedDays % rotation.length]).id;
  const t = topics.find((t) => t.id === tid) || nextTopic(state);
  const kept = old?.ids.filter((id) => state.done[id]) || [];
  const previousSteps = daySteps(state, day);
  let used = previousSteps
    .filter((x) => kept.includes(x.id))
    .reduce((s, x) => s + x.minutes, 0);
  const ids = [...kept];
  const add = (s: Step) => {
    if (!state.done[s.id] && !ids.includes(s.id) && used + s.minutes <= limit) {
      ids.push(s.id);
      used += s.minutes;
      return true;
    }
    return false;
  };
  const paragraph: Step = {
    id: `paragraph:${day}`,
    topicId: '',
    title: '',
    detail: '',
    minutes: 10,
    kind: 'paragraph',
  };
  const reserve = limit >= 50 && !ids.includes(paragraph.id) ? 10 : 0;
  const due = topics.find(
    (x) =>
      completed(x, state) &&
      state.done[`${x.id}:check`] < day &&
      !state.done[`recall:${x.id}`],
  );
  if (due && limit >= 100)
    add({
      id: `recall:${due.id}`,
      topicId: due.id,
      title: '',
      detail: '',
      minutes: 10,
      kind: 'review',
    });
  const candidates = [
    t,
    ...topics.filter(
      (x) =>
        x.subject === t.subject && !x.practice && !x.previous && x.id !== t.id,
    ),
  ];
  let stop = false;
  for (const c of candidates) {
    if (completed(c, state)) continue;
    for (const s of topicSteps(c, state)) {
      if (state.done[s.id] || ids.includes(s.id)) continue;
      if (used + s.minutes > limit - reserve) {
        stop = true;
        break;
      }
      add(s);
    }
    if (stop) break;
  }
  if (limit >= 50) add(paragraph);
  return { mode: limit, focus: t.id, ids, kind: 'focus', version: 2 };
}
export function withToday(state: StudyState, day: string) {
  return state.plans[day]?.version === 2
    ? state
    : {
        ...state,
        plans: { ...state.plans, [day]: makeBalancedPlan(state, day) },
      };
}

export const workRotation = [
  ['Matematik', 'Türkçe'],
  ['Matematik', 'Tarih'],
  ['Matematik', 'Türkçe'],
  ['Matematik', 'Coğrafya'],
  ['Matematik', 'Türkçe'],
  ['Türkçe', 'Vatandaşlık'],
];
export function studiedDayCount(state: StudyState, day: string) {
  return Object.entries(state.plans).filter(
    ([key, p]) =>
      key < day &&
      (day <= workEnd || key > workEnd) &&
      p.ids.some((id) => state.done[id] === key),
  ).length;
}
export function defaultMode(day: string) {
  return day <= workEnd
    ? 50
    : day <= '2026-09-30'
      ? 240
      : day >= '2026-10-23'
        ? 100
        : 360;
}
export type ProgramSlot = { subject: string; minutes: number };
export function programSlots(
  state: StudyState,
  day: string,
  mode = defaultMode(day),
): ProgramSlot[] {
  const i = studiedDayCount(state, day) % 6;
  if (mode === 25)
    return [
      {
        subject: [
          'Matematik',
          'Türkçe',
          'Tarih',
          'Matematik',
          'Coğrafya',
          'Vatandaşlık',
        ][i],
        minutes: 25,
      },
    ];
  if (mode === 50)
    return workRotation[i].map((subject) => ({ subject, minutes: 25 }));
  const general = [
    'Tarih',
    'Coğrafya',
    'Vatandaşlık',
    'Tarih',
    'Coğrafya',
    'Vatandaşlık',
  ][i];
  if (mode === 100)
    return [
      { subject: 'Matematik', minutes: 40 },
      { subject: 'Türkçe', minutes: 25 },
      { subject: i === 5 ? 'Geometri' : general, minutes: 25 },
      { subject: 'Tekrar', minutes: 10 },
    ];
  if (mode <= 240)
    return [
      { subject: 'Matematik', minutes: 80 },
      { subject: 'Türkçe', minutes: 65 },
      { subject: general, minutes: 65 },
      { subject: 'Tekrar', minutes: 20 },
      { subject: 'Paragraf', minutes: 10 },
    ];
  return [
    { subject: 'Matematik', minutes: 100 },
    { subject: 'Türkçe', minutes: 80 },
    { subject: general, minutes: 80 },
    {
      subject: [
        'Geometri',
        'Tarih',
        'Coğrafya',
        'Geometri',
        'Vatandaşlık',
        'Tarih',
      ][i],
      minutes: 70,
    },
    { subject: 'Tekrar', minutes: 20 },
    { subject: 'Paragraf', minutes: 10 },
  ];
}
export function customStep(id: string, state: StudyState): Step | undefined {
  const final = /^finalreview:(20\d{2}-\d{2}-\d{2}):([0-3])$/.exec(id);
  if (final)
    return {
      id,
      topicId: '',
      title: [
        'Matematik ve geometri · eski yanlışlar',
        'Türkçe · eski yanlışlar',
        'Tarih ve coğrafya · kısa tekrar',
        'Vatandaşlık · kısa tekrar',
      ][Number(final[2])],
      detail:
        'Yeni konu açmadan, daha önce çalıştığın notları kapatıp hatırla; birkaç eski yanlışını yeniden çöz. 25 dakika üst sınır, erken bırakabilirsin.',
      minutes: 25,
      kind: 'review',
    };
  const refresh = /^refresh:(20\d{2}-\d{2}-\d{2}):(10|20)$/.exec(id);
  if (refresh) {
    const recent = topics
      .filter((t) =>
        topicSteps(t, state).some(
          (s) => state.done[s.id] && state.done[s.id] < refresh[1],
        ),
      )
      .slice(-3);
    return {
      id,
      topicId: '',
      title: 'Notları kapatıp hatırla',
      detail: recent.length
        ? `Eski yanlışlarından birkaçını çöz: ${recent.map((t) => t.name).join(', ')}. Hatırlayamadığın yerde kısa notuna dön.`
        : 'Daha önce baktığın doğal sayılar, tek–çift ve faktöriyelden birkaç soru çöz. Önce çözümü kapatıp kendin dene.',
      minutes: Number(refresh[2]),
      kind: 'review',
    };
  }
  const recall = /^spaced:(s\d+-\d+):(1|3|7)$/.exec(id);
  if (recall) {
    const t = topics.find((t) => t.id === recall[1]);
    if (t)
      return {
        id,
        topicId: t.id,
        title: `Hatırla: ${t.name}`,
        detail:
          'Notların kapalıyken üç bilgiyi anlat; eski yanlışlarından iki soruyu çöz. Takılırsan yalnız o noktaya dön.',
        minutes: 10,
        kind: 'review',
      };
  }
  const mock = /^mock:(20\d{2}-\d{2}-\d{2}):(solve|review)$/.exec(id);
  if (mock)
    return {
      id,
      topicId: '',
      title:
        mock[2] === 'solve'
          ? 'Tam denemeyi süre tutarak çöz'
          : 'Denemedeki yanlışları incele',
      detail:
        mock[2] === 'solve'
          ? 'Elindeki KPSS ortaöğretim denemesini 130 dakika tutarak, yardım almadan çöz. Konuların bitmiş olması gerekmiyor.'
          : 'Doğru, yanlış ve boşlarını ders ders say. Yanlışın nedenini yaz: konu eksiği, işlem/okuma hatası veya süre. En çok tekrar eden iki eksiği sonraki çalışmalara seç.',
      minutes: mock[2] === 'solve' ? 130 : 40,
      kind: 'practice',
    };
}
export function makeBalancedPlan(
  state: StudyState,
  day: string,
  mode?: number,
): DayPlan {
  const old = state.plans[day];
  const limit =
    mode ?? (old && old.kind !== 'exam' ? old.mode : defaultMode(day));
  const kept = old?.ids.filter((id) => state.done[id]) || [];
  const existing = daySteps(state, day).filter((s) => kept.includes(s.id));
  let used = existing.reduce((n, s) => n + s.minutes, 0);
  const ids = [...kept];
  const slots = programSlots(state, day, limit);
  const add = (step: Step, quota: number) => {
    if (
      state.done[step.id] ||
      ids.includes(step.id) ||
      step.minutes > quota ||
      used + step.minutes > limit
    )
      return false;
    ids.push(step.id);
    used += step.minutes;
    return true;
  };
  if (day >= '2026-10-23') {
    for (let i = 0; i < 4; i++) {
      const s = customStep(`finalreview:${day}:${i}`, state)!;
      if (used + s.minutes <= Math.min(limit, 100)) add(s, 25);
    }
    return {
      mode: limit,
      focus: old?.focus || 's0-7',
      ids,
      kind: 'mixed',
      version: 2,
    };
  }
  for (const slot of slots) {
    let available =
      slot.minutes -
      existing
        .filter((s) =>
          slot.subject === 'Tekrar'
            ? s.id.startsWith('refresh:') || s.id.startsWith('spaced:')
            : slot.subject === 'Paragraf'
              ? s.kind === 'paragraph'
              : topics.find((t) => t.id === s.topicId)?.subject ===
                slot.subject,
        )
        .reduce((n, s) => n + s.minutes, 0);
    if (slot.subject === 'Tekrar') {
      for (const t of topics) {
        if (available < 10 || !completed(t, state)) continue;
        const stages = [1, 3, 7];
        const stage = stages.find((n) => !state.done[`spaced:${t.id}:${n}`]);
        if (!stage) continue;
        const previous =
          stage === 1
            ? state.done[`${t.id}:check`]
            : state.done[`spaced:${t.id}:${stage === 3 ? 1 : 3}`];
        const days = stage === 1 ? 1 : stage === 3 ? 2 : 4;
        if (
          previous &&
          Date.parse(day) - Date.parse(previous) >= days * 86400000
        ) {
          const step = customStep(`spaced:${t.id}:${stage}`, state)!;
          if (add(step, available)) available -= 10;
        }
      }
      if (available >= 10)
        add(
          customStep(`refresh:${day}:${available >= 20 ? 20 : 10}`, state)!,
          available,
        );
      continue;
    }
    if (slot.subject === 'Paragraf') {
      add(
        {
          id: `paragraph:${day}`,
          topicId: '',
          title: '',
          detail: '',
          minutes: 10,
          kind: 'paragraph',
        },
        available,
      );
      continue;
    }
    const t = nextTopic(state, slot.subject);
    if (t.subject !== slot.subject) continue;
    for (const step of topicSteps(t, state)) {
      if (state.done[step.id] || ids.includes(step.id)) continue;
      if (!add(step, available)) break;
      available -= step.minutes;
    }
    // Do not queue the next topic before this one's independent check is passed.
  }
  const first = ids
    .map((id) => topics.find((t) => t.id === id.split(':')[0]))
    .find(Boolean);
  return {
    mode: limit,
    focus: first?.id || nextTopic(state, slots[0].subject).id,
    ids,
    kind: 'mixed',
    version: 2,
  };
}
export function makePlan(
  state: StudyState,
  day: string,
  mode?: number,
  focus?: string,
): DayPlan {
  if (focus || state.plans[day]?.kind === 'focus')
    return makeFocusedPlan(state, day, mode, focus);
  return makeBalancedPlan(state, day, mode);
}
export function makeExamPlan(state: StudyState, day: string): DayPlan {
  const kept = state.plans[day]?.ids.filter((id) => state.done[id]) || [];
  const extra = [`mock:${day}:solve`, `mock:${day}:review`].filter(
    (id) => !kept.includes(id),
  );
  const minutes =
    daySteps(state, day)
      .filter((s) => kept.includes(s.id))
      .reduce((n, s) => n + s.minutes, 0) +
    extra.reduce((n, id) => n + customStep(id, state)!.minutes, 0);
  return {
    mode: Math.max(170, minutes),
    focus: state.plans[day]?.focus || 's0-7',
    ids: [...kept, ...extra],
    kind: 'exam',
    version: 2,
  };
}
export function validateState(value: unknown): value is StudyState {
  if (!value || typeof value !== 'object') return false;
  const s = value as StudyState;
  if (!validateCompanion(s, new Set(topics.map((t) => t.id)))) return false;
  if (
    typeof s.application !== 'boolean' ||
    !s.done ||
    !s.plans ||
    !s.extra ||
    typeof s.done !== 'object' ||
    typeof s.plans !== 'object' ||
    typeof s.extra !== 'object' ||
    Array.isArray(s.done) ||
    Array.isArray(s.plans) ||
    Array.isArray(s.extra)
  )
    return false;
  if (Object.keys(s.done).length > 4000 || Object.keys(s.plans).length > 400)
    return false;
  if (
    !Object.entries(s.extra).every(
      ([id, n]) =>
        topics.some((t) => t.id === id && !t.practice) &&
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 20,
    )
  )
    return false;
  const known = new Set(allSteps(s).map((x) => x.id));
  const validId = (id: string) =>
    known.has(id) ||
    Boolean(customStep(id, s)) ||
    /^paragraph:20\d{2}-\d{2}-\d{2}$/.test(id) ||
    (id.startsWith('recall:') && topics.some((t) => `recall:${t.id}` === id));
  const validDay = (d: string) =>
    /^20\d{2}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
  return (
    Object.entries(s.done).every(
      ([id, d]) => validId(id) && typeof d === 'string' && validDay(d),
    ) &&
    Object.entries(s.plans).every(
      ([day, p]) =>
        validDay(day) &&
        p &&
        (p.kind === 'exam'
          ? Number.isInteger(p.mode) && p.mode >= 170 && p.mode <= 1000
          : [25, 50, 100, 150, 200, 240, 360].includes(p.mode)) &&
        (p.kind === undefined || ['mixed', 'focus', 'exam'].includes(p.kind)) &&
        (p.version === undefined || p.version === 2) &&
        topics.some((t) => t.id === p.focus) &&
        Array.isArray(p.ids) &&
        p.ids.length <= 50 &&
        new Set(p.ids).size === p.ids.length &&
        p.ids.every((id) => typeof id === 'string' && validId(id)),
    )
  );
}

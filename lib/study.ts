import catalog from './topics.json';

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
export type DayPlan = { mode: number; focus: string; ids: string[] };
export type StudyState = {
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
export function makePlan(
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
  return { mode: limit, focus: t.id, ids };
}
export function withToday(state: StudyState, day: string) {
  return state.plans[day]
    ? state
    : { ...state, plans: { ...state.plans, [day]: makePlan(state, day) } };
}
export function validateState(value: unknown): value is StudyState {
  if (!value || typeof value !== 'object') return false;
  const s = value as StudyState;
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
        [25, 50, 100, 150, 200].includes(p.mode) &&
        topics.some((t) => t.id === p.focus) &&
        Array.isArray(p.ids) &&
        p.ids.length <= 50 &&
        new Set(p.ids).size === p.ids.length &&
        p.ids.every((id) => typeof id === 'string' && validId(id)),
    )
  );
}

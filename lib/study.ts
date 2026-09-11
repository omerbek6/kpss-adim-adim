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
export const programStart = '2026-09-13';
export type PriorityTier = 'essential' | 'high' | 'selective' | 'skip';
export type TopicMeta = {
  tier: PriorityTier;
  label: string;
  reason: string;
};
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
  kind?: 'mixed' | 'focus' | 'exam' | 'prestart';
  version?: 2;
};
export type StudyState = CompanionState & {
  done: Record<string, string>;
  plans: Record<string, DayPlan>;
  extra: Record<string, number>;
  application: boolean;
  skipped?: Record<string, string>;
  skipOverrides?: string[];
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

const essentialTopics = new Set([
  's0-1',
  's0-3',
  's0-4',
  's0-5',
  's0-6',
  's0-7',
  's0-8',
  's0-9',
  's0-11',
  's0-12',
  's0-13',
  's0-18',
  's0-20',
  's0-22',
  's0-24',
  's0-34',
  's0-37',
  's1-1',
  's1-2',
  's1-4',
  's1-5',
  's1-6',
  's1-10',
  's1-11',
  's1-12',
  's1-13',
  's2-1',
  's2-6',
  's2-14',
  's2-15',
  's2-16',
  's2-17',
  's2-24',
  's2-36',
  's2-39',
  's3-1',
  's3-17',
  's3-18',
  's3-24',
  's3-25',
  's3-29',
  's3-30',
  's3-33',
  's3-34',
  's3-35',
  's3-41',
  's4-1',
  's4-4',
  's4-7',
  's4-18',
  's4-25',
  's4-27',
  's4-29',
  's4-30',
  's4-34',
  's4-36',
  's4-40',
  's4-46',
  's4-50',
  's5-1',
  's5-7',
  's5-9',
  's5-10',
  's5-13',
  's5-17',
  's5-19',
]);
const highTopics = new Set([
  's0-10',
  's0-14',
  's0-15',
  's0-16',
  's0-23',
  's0-25',
  's0-29',
  's0-31',
  's1-3',
  's1-7',
  's1-8',
  's1-9',
  's1-14',
  's2-11',
  's2-30',
  's2-33',
  's2-42',
  's2-45',
  's3-5',
  's3-6',
  's3-7',
  's3-10',
  's3-12',
  's4-10',
  's4-11',
  's4-12',
  's4-53',
  's5-4',
  's5-23',
]);
const skipTopics = new Set(['s0-32', 's0-33', 's1-18', 's1-20', 's4-56']);
const exactVideoUrls: Record<string, string> = {
  's0-1': 'https://www.youtube.com/watch?v=U10mvNleW7Q',
  's0-7': 'https://www.youtube.com/watch?v=iU2fbEeyIYE',
  's0-18': 'https://www.youtube.com/watch?v=ScrYpNV7fMI',
  's2-14': 'https://www.youtube.com/watch?v=oNUOLz0tLvU',
  's2-36': 'https://www.youtube.com/watch?v=aeSFMfbMHr8',
  's3-5': 'https://www.youtube.com/watch?v=n_0zTtElnQ0',
  's3-9': 'https://www.youtube.com/watch?v=eYC_siMiEQQ',
  's3-18': 'https://www.youtube.com/watch?v=AKIJRFcGdcU',
  's4-25': 'https://www.youtube.com/watch?v=XZucXJ5XOfI',
  's5-1': 'https://www.youtube.com/watch?v=WzDYrVlF7u8',
};
const skipReasons: Record<string, string> = {
  Matematik:
    'Bu turda çok zaman isteyen ve temel netlere göre getirisi daha belirsiz; denemelerde ihtiyaç çıkarsa geri döneceğiz.',
  Geometri:
    'Önce temel üçgen ve dörtgenleri oturt; ileri başlıklar ancak temel netler güvenli olunca.',
  Tarih:
    'Geniş kronoloji içinde son turda kısa özet ve soru üzerinden ele alınacak.',
};
export function topicMeta(t: Topic): TopicMeta {
  if (t.practice)
    return {
      tier: 'selective',
      label: 'Soru turu',
      reason: 'Yeni konu değil; ilgili başlıklar öğrenildikten sonra çöz.',
    };
  const tier: PriorityTier = skipTopics.has(t.id)
    ? 'skip'
    : essentialTopics.has(t.id)
      ? 'essential'
      : highTopics.has(t.id)
        ? 'high'
        : 'selective';
  const labels: Record<PriorityTier, string> = {
    essential: 'Önce',
    high: 'Yüksek getiri',
    selective: 'Seçerek çalış',
    skip: 'Bu turda geç',
  };
  const reasons: Record<PriorityTier, string> = {
    essential:
      'Temel ve sık karşılaşılan soru becerilerini kurar; zaman daralırsa ilk korunacak grup.',
    high: 'Temel oturduğunda net kazandırma ihtimali yüksek; ikinci sırada ilerle.',
    selective:
      'Zaman kalırsa veya denemede eksik çıkarsa çalış; diğerlerini bekletme.',
    skip:
      skipReasons[t.subject] ||
      'Şimdilik geç; deneme sonucu gerekirse geri dön.',
  };
  return { tier, label: labels[tier], reason: reasons[tier] };
}
export function topicVideoUrl(t: Topic) {
  if (exactVideoUrls[t.id]) return exactVideoUrls[t.id];
  const teacher = teachers[t.subject]?.name || '';
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${teacher} KPSS ${t.name}`)}`;
}
export function topicVideoLabel(t: Topic) {
  return exactVideoUrls[t.id]
    ? `${teachers[t.subject].name} · bu konu anlatımını aç`
    : `${teachers[t.subject].name} · bu başlığı YouTube’da aç`;
}
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
  const skipped = state.skipped || {};
  const overrides = new Set(state.skipOverrides || []);
  const isSkipped = (t: Topic) =>
    !!skipped[t.id] || (topicMeta(t).tier === 'skip' && !overrides.has(t.id));
  const rank = (t: Topic) =>
    ({ essential: 0, high: 1, selective: 2, skip: 3 })[topicMeta(t).tier];
  const candidates = topics
    .filter(
      (t) =>
        t.subject === subject &&
        !t.practice &&
        !t.previous &&
        !isSkipped(t) &&
        !completed(t, state),
    )
    .sort((a, b) => rank(a) - rank(b));
  return (
    candidates[0] ||
    topics.find(
      (t) =>
        t.subject === subject &&
        !t.practice &&
        !isSkipped(t) &&
        !completed(t, state),
    ) ||
    topics.find(
      (t) =>
        !t.practice && !t.previous && !isSkipped(t) && !completed(t, state),
    ) ||
    topics.find((t) => !t.practice && !isSkipped(t)) ||
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
  if (day < programStart)
    return { mode: 0, focus: 's0-7', ids: [], kind: 'prestart', version: 2 };
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
        plans: {
          ...state.plans,
          [day]:
            day < programStart
              ? {
                  mode: 0,
                  focus: 's0-7',
                  ids: [],
                  kind: 'prestart' as const,
                  version: 2 as const,
                }
              : makeBalancedPlan(state, day),
        },
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
  if (day < programStart)
    return { mode: 0, focus: 's0-7', ids: [], kind: 'prestart', version: 2 };
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
  const validDay = (d: string) =>
    /^20\d{2}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
  if (
    s.skipped !== undefined &&
    (!s.skipped ||
      typeof s.skipped !== 'object' ||
      Array.isArray(s.skipped) ||
      Object.keys(s.skipped).length > 128 ||
      !Object.entries(s.skipped).every(
        ([id, d]) =>
          topics.some((t) => t.id === id && !t.practice) &&
          typeof d === 'string' &&
          validDay(d),
      ))
  )
    return false;
  if (
    s.skipOverrides !== undefined &&
    (!Array.isArray(s.skipOverrides) ||
      s.skipOverrides.length > 128 ||
      new Set(s.skipOverrides).size !== s.skipOverrides.length ||
      !s.skipOverrides.every((id) =>
        topics.some((t) => t.id === id && !t.practice),
      ))
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
  return (
    Object.entries(s.done).every(
      ([id, d]) => validId(id) && typeof d === 'string' && validDay(d),
    ) &&
    Object.entries(s.plans).every(
      ([day, p]) =>
        validDay(day) &&
        p &&
        Array.isArray(p.ids) &&
        (p.kind === 'prestart'
          ? p.mode === 0 && p.ids.length === 0
          : p.kind === 'exam'
            ? Number.isInteger(p.mode) && p.mode >= 170 && p.mode <= 1000
            : [25, 50, 100, 150, 200, 240, 360].includes(p.mode)) &&
        (p.kind === undefined ||
          ['mixed', 'focus', 'exam', 'prestart'].includes(p.kind)) &&
        (p.version === undefined || p.version === 2) &&
        topics.some((t) => t.id === p.focus) &&
        p.ids.length <= 50 &&
        new Set(p.ids).size === p.ids.length &&
        p.ids.every((id) => typeof id === 'string' && validId(id)),
    )
  );
}

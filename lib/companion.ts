import { validateQuiz, type QuizState } from './quiz-state';

export type FocusTimer = {
  id: string;
  day: string;
  stepId: string;
  label: string;
  duration: number;
  remaining: number;
  startedAt: number | null;
  kind?: 'study' | 'break';
};
export type FocusSession = { day: string; seconds: number; label: string };
export const examSections = [
  { name: 'Türkçe', count: 30 },
  { name: 'Matematik + Geometri', count: 30 },
  { name: 'Tarih', count: 27 },
  { name: 'Coğrafya', count: 18 },
  { name: 'Vatandaşlık', count: 9 },
  { name: 'Güncel bilgiler', count: 6 },
];
export type ExamResult = {
  id: string;
  day: string;
  name: string;
  scores: { right: number; wrong: number }[];
  note: string;
};
export type CompanionState = QuizState & {
  timer?: FocusTimer | null;
  focusSessions?: Record<string, FocusSession>;
  exams?: ExamResult[];
  notes?: Record<string, string>;
  favorites?: string[];
  videoPositions?: Record<string, number>;
  practiceAnswers?: Record<string, number[]>;
};
export function timerRemaining(t: FocusTimer, now = Date.now()) {
  return Math.max(
    0,
    t.remaining -
      (t.startedAt === null
        ? 0
        : Math.max(0, Math.floor((now - t.startedAt) / 1000))),
  );
}
export function examNet(exam: ExamResult) {
  return exam.scores.reduce((n, s) => n + s.right - s.wrong / 4, 0);
}
export function saveTimer<T extends CompanionState>(
  state: T,
  now = Date.now(),
): T {
  const t = state.timer;
  if (!t) return state;
  const seconds = t.duration - timerRemaining(t, now);
  return {
    ...state,
    timer: null,
    focusSessions:
      seconds > 0 && t.kind !== 'break'
        ? {
            ...state.focusSessions,
            [t.id]: { day: t.day, seconds, label: t.label },
          }
        : state.focusSessions,
  };
}
export function extendTimer(
  t: FocusTimer,
  seconds: number,
  now = Date.now(),
): FocusTimer {
  const added = Math.min(seconds, 10800 - t.duration);
  return {
    ...t,
    duration: t.duration + added,
    remaining: timerRemaining(t, now) + added,
    startedAt: t.startedAt === null ? null : now,
  };
}
export function shiftDay(day: string, n: number) {
  return new Date(Date.parse(day + 'T12:00:00Z') + n * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function weekMinutes(state: CompanionState, day: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = shiftDay(day, i - 6);
    return {
      day: d,
      minutes: Math.round(
        Object.values(state.focusSessions || {})
          .filter((s) => s.day === d)
          .reduce((n, s) => n + s.seconds, 0) / 60,
      ),
    };
  });
}
export function validateCompanion(s: CompanionState, topicIds: Set<string>) {
  if (!validateQuiz(s)) return false;
  const object = (o: unknown): o is Record<string, unknown> =>
    !!o && typeof o === 'object' && !Array.isArray(o);
  const day = (d: unknown) =>
    typeof d === 'string' &&
    /^20\d{2}-\d{2}-\d{2}$/.test(d) &&
    !Number.isNaN(Date.parse(d)) &&
    new Date(d).toISOString().slice(0, 10) === d;
  const id = (s: unknown) =>
    typeof s === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(s);
  const small = (s: unknown, n: number) =>
    typeof s === 'string' && s.length <= n;
  if (s.timer !== undefined && s.timer !== null) {
    const t = s.timer;
    if (
      !object(t) ||
      !id(t.id) ||
      !day(t.day) ||
      !small(t.label, 180) ||
      !small(t.stepId, 120) ||
      !Number.isInteger(t.duration) ||
      t.duration < 60 ||
      t.duration > 10800 ||
      (t.kind !== undefined && !['study', 'break'].includes(t.kind)) ||
      !Number.isInteger(t.remaining) ||
      t.remaining < 0 ||
      t.remaining > t.duration ||
      (t.startedAt !== null &&
        (!Number.isInteger(t.startedAt) ||
          t.startedAt < 0 ||
          t.startedAt > 4102444800000))
    )
      return false;
  }
  if (
    s.focusSessions !== undefined &&
    (!object(s.focusSessions) ||
      Object.keys(s.focusSessions).length > 1000 ||
      !Object.entries(s.focusSessions).every(
        ([key, v]) =>
          id(key) &&
          object(v) &&
          day(v.day) &&
          Number.isInteger(v.seconds) &&
          v.seconds >= 1 &&
          v.seconds <= 10800 &&
          small(v.label, 180),
      ))
  )
    return false;
  if (
    s.exams !== undefined &&
    (!Array.isArray(s.exams) ||
      s.exams.length > 100 ||
      new Set(s.exams.map((e) => e?.id)).size !== s.exams.length ||
      !s.exams.every(
        (e) =>
          object(e) &&
          id(e.id) &&
          day(e.day) &&
          small(e.name, 80) &&
          e.name.trim().length > 0 &&
          small(e.note, 600) &&
          Array.isArray(e.scores) &&
          e.scores.length === 6 &&
          e.scores.every(
            (v, i) =>
              object(v) &&
              Number.isInteger(v.right) &&
              Number.isInteger(v.wrong) &&
              v.right >= 0 &&
              v.wrong >= 0 &&
              v.right + v.wrong <= examSections[i].count,
          ),
      ))
  )
    return false;
  if (
    s.notes !== undefined &&
    (!object(s.notes) ||
      Object.keys(s.notes).length > 128 ||
      !Object.entries(s.notes).every(
        ([id, note]) => topicIds.has(id) && small(note, 600),
      ))
  )
    return false;
  if (
    s.favorites !== undefined &&
    (!Array.isArray(s.favorites) ||
      s.favorites.length > 128 ||
      new Set(s.favorites).size !== s.favorites.length ||
      !s.favorites.every((id) => topicIds.has(id)))
  )
    return false;
  if (
    s.videoPositions !== undefined &&
    (!object(s.videoPositions) ||
      Object.keys(s.videoPositions).length > 128 ||
      !Object.entries(s.videoPositions).every(
        ([key, value]) =>
          topicIds.has(key) &&
          Number.isInteger(value) &&
          value >= 0 &&
          value <= 36000,
      ))
  )
    return false;
  if (
    s.practiceAnswers !== undefined &&
    (!object(s.practiceAnswers) ||
      Object.keys(s.practiceAnswers).length > 3 ||
      !Object.entries(s.practiceAnswers).every(
        ([key, values]) =>
          ['s0-7', 's0-9', 's0-18'].includes(key) &&
          Array.isArray(values) &&
          values.length === 10 &&
          values.every((n) => Number.isInteger(n) && n >= -1 && n <= 4),
      ))
  )
    return false;
  return true;
}

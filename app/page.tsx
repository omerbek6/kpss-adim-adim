'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Check,
  ArrowUpRight,
  Clock3,
  ChevronRight,
  BookOpen,
  CloudCheck,
  RefreshCw,
  ArrowLeft,
  CalendarDays,
  House,
  ChartNoAxesCombined,
  Smartphone,
  WifiOff,
  Search,
} from 'lucide-react';
import {
  topics,
  subjects,
  teachers,
  emptyState,
  dayKey,
  daySteps,
  topicSteps,
  allSteps,
  completed,
  withToday,
  makePlan,
  makeBalancedPlan,
  makeExamPlan,
  rangeLabel,
  formatMinutes,
  nextTopic,
  workEnd,
  examDate,
  type StudyState,
  type Step,
  type Topic,
} from '@/lib/study';
import { registerStudyTools } from '@/lib/webmcp';
import { ProgramPanel } from './program-panel';
import { FocusPanel } from './focus-panel';
import { ProgressPanel } from './progress-panel';
import { PwaPanel, usePwa } from './pwa-panel';
import { TopicNotes } from './topic-notes';
import { studyRequest } from '@/lib/client-request';

export default function Home() {
  const pwa = usePwa();
  const [state, setState] = useState<StudyState>(emptyState);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [date, setDate] = useState('');
  const [tab, setTab] = useState('today');
  const [subject, setSubject] = useState('Matematik');
  const [expanded, setExpanded] = useState('');
  const [query, setQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const stateRef = useRef(state);
  const revisionRef = useRef(revision);
  const busyRef = useRef(false);
  const readyRef = useRef(false);
  const dateRef = useRef('');
  const sync = (s: StudyState, r: number) => {
    stateRef.current = s;
    revisionRef.current = r;
    setState(s);
    setRevision(r);
  };
  const load = useCallback(async () => {
    setReady(false);
    readyRef.current = false;
    setError('');
    try {
      const response = await studyRequest({ cache: 'no-store' });
      if (!response.ok)
        throw new Error(
          'Kayıtlarına ulaşılamadı. İnternetini kontrol edip tekrar dene.',
        );
      if (!response.headers.get('Content-Type')?.includes('application/json'))
        throw new Error('Oturumunu yenilemek için sayfayı yeniden aç.');
      const data = (await response.json()) as {
        state: StudyState;
        revision: number;
      };
      const day = dayKey();
      dateRef.current = day;
      setDate(day);
      sync(withToday(data.state, day), data.revision);
      setReady(true);
      readyRef.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt yüklenemedi.');
    }
  }, []);
  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      const d = dayKey();
      if (dateRef.current && dateRef.current !== d) {
        dateRef.current = d;
        setDate(d);
        setState((prev) => {
          const s = withToday(prev, d);
          stateRef.current = s;
          return s;
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [load]);
  async function change(
    transform: (s: StudyState) => StudyState,
    message = 'Kaydedildi',
  ) {
    if (!navigator.onLine)
      throw new Error('İnternet bağlantısı yok. Bu değişiklik kaydedilmedi.');
    if (!readyRef.current || busyRef.current)
      throw new Error('Kayıt hazır olana kadar bekle.');
    busyRef.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    const before = stateRef.current;
    const next = transform(before);
    stateRef.current = next;
    setState(next);
    try {
      const response = await studyRequest({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: next, revision: revisionRef.current }),
      });
      const result = (await response.json()) as {
        state: StudyState;
        revision: number;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || 'Kayıt yapılamadı.');
      flushSync(() => sync(result.state, result.revision));
      setNotice(message);
      return { saved: true };
    } catch (e) {
      sync(before, revisionRef.current);
      setError(
        (e instanceof Error ? e.message : 'Kayıt yapılamadı.') +
          ' Değişiklik geri alındı.',
      );
      throw e;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const changeRef = useRef(change);
  changeRef.current = change;
  const setStep = async (id: string, checked: boolean) => {
    const s = stateRef.current;
    const day = dateRef.current;
    const known = [...allSteps(s), ...daySteps(s, day)];
    const step = known.find((x) => x.id === id);
    if (!step) throw new Error('Çalışma adımı bulunamadı.');
    if (checked && step.kind === 'check') {
      const t = topics.find((t) => t.id === step.topicId)!;
      if (topicSteps(t, s).some((x) => x.id !== id && !s.done[x.id]))
        throw new Error('Önce bu konunun çalışma ve soru adımlarını tamamla.');
    }
    await changeRef.current(
      (prev) => {
        const done = { ...prev.done };
        if (checked) done[id] = day;
        else {
          delete done[id];
          if (
            step.topicId &&
            step.kind !== 'check' &&
            step.id.startsWith(step.topicId + ':')
          )
            delete done[`${step.topicId}:check`];
        }
        return { ...prev, done };
      },
      checked ? 'Bir adım daha tamamlandı.' : 'Tik kaldırıldı.',
    );
    return { stepId: id, completed: checked, saved: true };
  };
  const setStepRef = useRef(setStep);
  setStepRef.current = setStep;
  useEffect(
    () =>
      registerStudyTools(
        () => ({
          date: dateRef.current,
          steps: daySteps(stateRef.current, dateRef.current).map((s) => ({
            ...s,
            completed: !!stateRef.current.done[s.id],
          })),
          topics: topics
            .filter((t) => !t.practice)
            .map((t) => ({
              id: t.id,
              subject: t.subject,
              name: t.name,
              estimate: rangeLabel(t),
              completed: completed(t, stateRef.current),
            })),
        }),
        (id, checked) => setStepRef.current(id, checked),
      ),
    [],
  );
  const safe = (p: Promise<unknown>) => {
    void p.catch((e) => {
      if (!error)
        setError(e instanceof Error ? e.message : 'İşlem yapılamadı.');
    });
  };
  const plan = date ? state.plans[date] : undefined;
  const steps = date ? daySteps(state, date) : [];
  const focus =
    topics.find((t) => t.id === plan?.focus) ||
    topics.find((t) => t.id === 's0-7')!;
  const doneToday = steps.filter((s) => state.done[s.id]).length;
  const totalMinutes = steps.reduce((n, s) => n + s.minutes, 0);
  const doneMinutes = steps
    .filter((s) => state.done[s.id])
    .reduce((n, s) => n + s.minutes, 0);
  const completedCount = topics.filter(
    (t) => !t.practice && completed(t, state),
  ).length;
  const blocked = !ready || busy || !pwa.online;
  const matchesTopic = (t: Topic) =>
    t.name
      .toLocaleLowerCase('tr-TR')
      .includes(query.trim().toLocaleLowerCase('tr-TR')) &&
    (topicFilter === 'all' ||
      (topicFilter === 'revisit' && state.favorites?.includes(t.id)) ||
      (topicFilter === 'started' &&
        topicSteps(t, state).some((s) => state.done[s.id]) &&
        !completed(t, state)));
  const openTopic = (id: string) => {
    const t = topics.find((t) => t.id === id);
    if (!t) return;
    setSubject(t.subject);
    setQuery('');
    setTopicFilter('all');
    setExpanded(id);
    setTab('topics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const afterWork = !!date && date > workEnd;
  const mixed = plan?.kind === 'mixed';
  const isExam = plan?.kind === 'exam';
  const programSubjects = [
    ...new Set(
      steps
        .map((s) =>
          s.kind === 'paragraph'
            ? 'Türkçe'
            : topics.find((t) => t.id === s.topicId)?.subject,
        )
        .filter(Boolean),
    ),
  ];
  const daysLeft = date
    ? Math.max(
        0,
        Math.round((Date.parse(examDate) - Date.parse(date)) / 86400000),
      )
    : null;
  const dateLabel = date
    ? new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
        timeZone: 'Europe/Istanbul',
      }).format(new Date(date + 'T12:00:00Z'))
    : 'Çalışma defterin';
  const modes = afterWork
    ? [
        { value: 25, label: 'Çok yorgunum' },
        { value: 50, label: 'Kısa çalışma' },
        { value: 100, label: 'Hafif gün' },
        { value: 240, label: '4 saat' },
        { value: 360, label: '6 saat' },
      ]
    : [
        { value: 25, label: 'Çok yorgunum' },
        { value: 50, label: 'İş günü' },
        { value: 100, label: 'İzin günüm' },
      ];
  async function selectTopic(t: Topic) {
    await change(
      (s) => ({
        ...s,
        plans: { ...s.plans, [date]: makePlan(s, date, undefined, t.id) },
      }),
      'Bugün tek konuya odaklanıyorsun. İstersen dengeli programa dönebilirsin.',
    );
    setTab('today');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function canCheck(step: Step) {
    if (step.kind !== 'check') return true;
    const t = topics.find((t) => t.id === step.topicId);
    return (
      !t ||
      topicSteps(t, state).every((s) => s.id === step.id || state.done[s.id])
    );
  }
  const row = (step: Step, context: string) => (
    <label
      className={`task-row ${state.done[step.id] ? 'is-done' : ''}`}
      key={step.id}
      htmlFor={context + step.id}
    >
      <Checkbox
        id={context + step.id}
        checked={!!state.done[step.id]}
        onCheckedChange={(value) => safe(setStep(step.id, !!value))}
        disabled={blocked || !canCheck(step)}
        className="task-check"
      />
      <div>
        <strong>{step.title}</strong>
        <p>
          {step.detail}
          {!canCheck(step) && ' Önce üstteki çalışma adımlarını tamamla.'}
        </p>
        {context === 'today-' && step.topicId && (
          <small>
            {topics.find((t) => t.id === step.topicId)?.subject} ·{' '}
            {topics.find((t) => t.id === step.topicId)?.name}
          </small>
        )}
      </div>
      <span className="task-time">{step.minutes} dk</span>
    </label>
  );
  function topicRow(t: Topic) {
    const st = topicSteps(t, state);
    const count = st.filter((s) => state.done[s.id]).length;
    const isDone = completed(t, state);
    return (
      <article
        className={`topic-item ${isDone ? 'topic-done' : ''}`}
        key={t.id}
      >
        <button
          className="topic-summary"
          aria-expanded={expanded === t.id}
          onClick={() => setExpanded(expanded === t.id ? '' : t.id)}
        >
          <span className="topic-status">
            {isDone ? <Check size={19} /> : <BookOpen size={18} />}
          </span>
          <span className="topic-title">
            <strong>{t.name}</strong>
            <span>
              {isDone
                ? 'İlk çalışma tamam'
                : count
                  ? `${count} adım tamamlandı`
                  : t.previous
                    ? 'Daha önce baktın · istersen hatırla'
                    : t.practice
                      ? 'Yeni konu değil · soru çalışması'
                      : 'İlk çalışma'}
              {t.book.length > 1 ? ` · Pegem’de ${t.book.length} bölüm` : ''}
            </span>
          </span>
          <span className="topic-duration">
            {rangeLabel(t)}
            <ChevronRight
              size={18}
              className={expanded === t.id ? 'rotated' : ''}
            />
          </span>
        </button>
        {expanded === t.id && (
          <div className="topic-detail">
            <p className="estimate-copy">
              Bu süre, anlatım + ilk sorular + yanlışlara dönüş için başlangıç
              tahmini. Kitaptaki bütün soruları bitirme süresi değil. Sonraki
              gün 10 dakika tekrar ekle.
            </p>
            <div className="topic-actions">
              <button
                className="primary-btn"
                disabled={busy || !ready}
                onClick={() => safe(selectTopic(t))}
              >
                Bugün bunu çalış <ChevronRight size={16} />
              </button>
              <a
                href={teachers[t.subject].url}
                target="_blank"
                rel="noreferrer"
              >
                {teachers[t.subject].name} <ArrowUpRight size={16} />
              </a>
            </div>
            <Progress
              value={(count / st.length) * 100}
              aria-label={t.name + ' ilerlemesi'}
            />
            <div className="small-info">
              {count} / {st.length} adım · Hazır adımların süre toplamı:{' '}
              {formatMinutes(st.reduce((a, s) => a + s.minutes, 0))}
            </div>
            {st.map((s) => row(s, 'topic-'))}
            {!t.practice && (
              <button
                className="plain-btn extra-button"
                disabled={!ready || busy || (state.extra[t.id] || 0) >= 20}
                onClick={() =>
                  safe(
                    change((s) => {
                      const done = { ...s.done };
                      delete done[`${t.id}:check`];
                      return {
                        ...s,
                        done,
                        extra: { ...s.extra, [t.id]: (s.extra[t.id] || 0) + 1 },
                      };
                    }, 'Bu konuya 25 dakikalık bir çalışma eklendi.'),
                  )
                }
              >
                Henüz oturmadı · 25 dakika daha ekle
              </button>
            )}
            <TopicNotes
              key={t.id + ':notes'}
              topic={t}
              state={state}
              disabled={blocked}
              onSave={change}
            />
            <details className="book-details">
              <summary>Pegem’de hangi bölümler?</summary>
              <ul>
                {t.book.map((b) => (
                  <li key={b.no}>{b.label}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </article>
    );
  }
  return (
    <div className="site-wrap">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Check size={23} />
          </span>
          Adım Adım <span>KPSS 2026</span>
        </a>
        <span className="save-state" aria-live="polite">
          {busy ? (
            <RefreshCw size={15} className="spin" />
          ) : (
            <CloudCheck size={17} />
          )}{' '}
          {busy
            ? 'Kaydediliyor'
            : ready
              ? pwa.online
                ? 'Kayıtların yanında'
                : 'Çevrimdışısın'
              : 'Kayıtlar yükleniyor'}
        </span>
      </header>
      <main>
        {!pwa.online && (
          <div className="offline-banner" role="status">
            <WifiOff size={20} />
            <span>
              Bağlantı yok. Yeni tik ve notlar kaydedilemez. İnternet gelince
              devam et.
            </span>
          </div>
        )}
        {pwa.waiting && (
          <div className="offline-banner">
            <RefreshCw size={20} />
            <span>
              Yeni sürüm hazır. Açık formunu kaydet; ardından Uygulama
              bölümünden güncelle.
            </span>
          </div>
        )}
        <div className="page-heading">
          <div>
            <p className="eyebrow">{dateLabel.toLocaleUpperCase('tr-TR')}</p>
            <h1>Hedefin için, bugün.</h1>
            <p>
              {afterWork
                ? 'Artık daha fazla zamanın var. Çalışmaları gün içine yay.'
                : '27 Eylül’e kadar 09.00–18.00 çalışıyorsun. Akşam için küçük bir hedef seç.'}
            </p>
          </div>
          <a
            className="exam-chip"
            target="_blank"
            rel="noreferrer"
            href="https://osym.gov.tr/2026-kpss-ortaogretim-basvurularin-alinmasi"
          >
            <CalendarDays size={17} />
            <span>
              25 Ekim
              {daysLeft !== null && date <= examDate ? (
                <small>
                  {daysLeft === 0 ? 'Sınav bugün' : daysLeft + ' gün kaldı'}
                </small>
              ) : (
                <small>2026 KPSS Ortaöğretim</small>
              )}
            </span>
          </a>
        </div>
        {date && date <= '2026-09-08' && !state.application && (
          <div className="application-banner">
            <div>
              <strong>Bugün başvurunun son günü.</strong>
              <p>ÖSYM’den başvuru ve ödeme durumunu kontrol et.</p>
            </div>
            <a href="https://ais.osym.gov.tr/" target="_blank" rel="noreferrer">
              ÖSYM’yi aç <ArrowUpRight size={15} />
            </a>
            <label>
              <Checkbox
                checked={state.application}
                onCheckedChange={(v) =>
                  safe(change((s) => ({ ...s, application: !!v })))
                }
                disabled={blocked}
              />
              Kontrol ettim
            </label>
          </div>
        )}
        {error && (
          <div className="error-box" role="alert">
            <p>{error}</p>
            <button onClick={() => void load()} disabled={busy}>
              Son kaydı tekrar yükle
            </button>
            <button onClick={() => window.location.reload()} disabled={busy}>
              Sayfayı yeniden aç
            </button>
          </div>
        )}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(String(value))}
          className="main-tabs"
        >
          <TabsList className="main-tab-list">
            <TabsTrigger value="today">
              <House />
              Bugün
            </TabsTrigger>
            <TabsTrigger value="program">
              <CalendarDays />
              Programım
            </TabsTrigger>
            <TabsTrigger value="topics">
              <BookOpen />
              Konular
            </TabsTrigger>
            <TabsTrigger value="progress">
              <ChartNoAxesCombined />
              İlerlemem
            </TabsTrigger>
            <TabsTrigger value="app">
              <Smartphone />
              Uygulama
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            {date && ready && (
              <FocusPanel
                state={state}
                date={date}
                next={steps.find((s) => !state.done[s.id])}
                disabled={blocked}
                onSave={change}
                onComplete={(id) => setStep(id, true)}
              />
            )}
            <div className="mode-section">
              <p>Bugün ne kadar enerjin var?</p>
              <Tabs
                value={isExam ? 'exam' : String(plan?.mode || 50)}
                onValueChange={(value) =>
                  safe(
                    change(
                      (s) => ({
                        ...s,
                        plans: {
                          ...s.plans,
                          [date]: makePlan(s, date, Number(value)),
                        },
                      }),
                      'Bugünkü süre değişti.',
                    ),
                  )
                }
              >
                <TabsList className="mode-list">
                  {modes.map((m) => (
                    <TabsTrigger
                      key={m.value}
                      value={String(m.value)}
                      disabled={blocked}
                    >
                      <strong>{m.label}</strong>
                      <span>{m.value} dakika</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="work-grid">
              <section className="today-card" aria-busy={!ready}>
                <div className="card-top">
                  <span className="subject-tag">
                    {isExam
                      ? 'DENEME GÜNÜ'
                      : mixed
                        ? 'DENGELİ PROGRAM'
                        : focus.subject.toLocaleUpperCase('tr-TR')}
                  </span>
                  <span className="time-tag">
                    <Clock3 size={16} />
                    {totalMinutes} dk net çalışma
                  </span>
                </div>
                <h2>
                  {isExam
                    ? 'Deneme + yanlışları inceleme'
                    : mixed
                      ? programSubjects.length
                        ? programSubjects.join(' + ')
                        : 'Hafif tekrar günü'
                      : focus.name}
                </h2>
                <p>
                  {isExam
                    ? 'Normal dersler yerine bugün bir deneme ve yanlışlarını inceleme var.'
                    : mixed
                      ? 'Dersleri aşağıdaki sırayla, ayrı çalışma parçaları olarak yap. Her derste kaldığın yer korunur.'
                      : focus.id === 's0-7'
                        ? 'Faktöriyelden sonraki adımın bu. Önceki konulara baştan dönmen gerekmiyor.'
                        : 'Bugün bu konunun sıradaki küçük adımlarını çalış.'}
                </p>
                <div className="balanced-actions">
                  <button
                    className="plain-btn"
                    onClick={() => setTab('program')}
                  >
                    Programın tamamını gör <ChevronRight size={16} />
                  </button>
                  {(!mixed || plan?.version !== 2) && (
                    <button
                      className="primary-btn"
                      disabled={blocked}
                      onClick={() =>
                        safe(
                          change(
                            (s) => ({
                              ...s,
                              plans: {
                                ...s.plans,
                                [date]: makeBalancedPlan(
                                  s,
                                  date,
                                  isExam ? undefined : plan?.mode,
                                ),
                              },
                            }),
                            'Dengeli program hazır; tiklerin korundu.',
                          ),
                        )
                      }
                    >
                      Dengeli programa dön
                    </button>
                  )}
                </div>
                <details className="focus-override">
                  <summary>
                    Bugün yalnızca bir konuya odaklanmak istiyorum
                  </summary>
                  <div className="focus-picker">
                    <label id="focus-label">Tek ders seç</label>
                    <Select
                      value={focus.subject}
                      onValueChange={(value) => {
                        if (typeof value === 'string')
                          safe(selectTopic(nextTopic(state, value)));
                      }}
                    >
                      <SelectTrigger
                        aria-labelledby="focus-label"
                        disabled={blocked}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </details>
                {ready ? (
                  <>
                    <div className="daily-progress">
                      <span>
                        {doneToday} / {steps.length} adım
                      </span>
                      <span>{doneMinutes} dk işaretledin</span>
                    </div>
                    <Progress
                      value={
                        steps.length ? (doneToday / steps.length) * 100 : 0
                      }
                      aria-label="Bugünkü ilerleme"
                    />
                    {steps.map((s) => row(s, 'today-'))}
                    {mixed &&
                      totalMinutes < (plan?.mode || 0) &&
                      date < '2026-10-23' && (
                        <div className="program-budget-note">
                          <p>
                            Seçtiğin süre bir üst sınır. Önce bu adımları bitir;
                            konu kontrolünü geçtiğinde kalan süreye yeni adımlar
                            alabilirsin. Süreyi doldurmak zorunda değilsin.
                          </p>
                          <button
                            className="plain-btn"
                            disabled={blocked}
                            onClick={() =>
                              safe(
                                change(
                                  (s) => ({
                                    ...s,
                                    plans: {
                                      ...s.plans,
                                      [date]: makeBalancedPlan(s, date),
                                    },
                                  }),
                                  'Kalan süreye uygun adımlar güncellendi.',
                                ),
                              )
                            }
                          >
                            Kalan süre için adımları yenile{' '}
                            <RefreshCw size={15} />
                          </button>
                        </div>
                      )}
                    {steps.length > 0 && doneToday === steps.length && (
                      <div className="success-box">
                        <Check size={21} />
                        <div>
                          <strong>Bugün için bu kadar yeterli.</strong>
                          <p>Yarın kaldığın yerden devam edeceksin.</p>
                        </div>
                      </div>
                    )}
                    {!steps.length && (
                      <p className="empty-copy">
                        Bu konu için seçtiğin süreye sığan adım kalmadı. Süreyi
                        artırabilir veya başka konu seçebilirsin.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="loading-copy">
                    <RefreshCw size={20} />
                    Çalışma adımların yükleniyor…
                  </div>
                )}
                {!isExam && !mixed && (
                  <>
                    <a
                      className="lesson-link"
                      href={
                        focus.id === 's0-7'
                          ? 'https://www.youtube.com/watch?v=iU2fbEeyIYE'
                          : teachers[focus.subject].url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {teachers[focus.subject].name} · konu anlatımını aç{' '}
                      <ArrowUpRight size={17} />
                    </a>
                    <p className="lesson-hint">
                      Pegem’de aynı başlığı aç. Videodaki konu sırası farklıysa
                      başlığın adıyla ilerle.
                    </p>
                    <button
                      className="plain-btn"
                      onClick={() => {
                        setSubject(focus.subject);
                        setExpanded(focus.id);
                        setTab('topics');
                      }}
                    >
                      Bu konunun bütün adımlarını gör <ChevronRight size={16} />
                    </button>
                  </>
                )}
                {mixed && (
                  <div className="mixed-lessons">
                    {programSubjects.map(
                      (s) =>
                        s && (
                          <a
                            className="lesson-link"
                            href={teachers[s].url}
                            target="_blank"
                            rel="noreferrer"
                            key={s}
                          >
                            {s} · {teachers[s].name}
                            <ArrowUpRight size={16} />
                          </a>
                        ),
                    )}
                    <p className="lesson-hint">
                      Pegem’de adımın konu başlığını aç. Videoların sırası
                      kitaptan farklı olabilir.
                    </p>
                  </div>
                )}
              </section>
              <aside className="right-column">
                <div className="guide-card">
                  <p className="eyebrow">
                    {mixed || isExam
                      ? 'BUGÜNÜN ÇALIŞMA BÜTÇESİ'
                      : 'BU KONUYA NE KADAR AYIRAYIM?'}
                  </p>
                  <h2>
                    {mixed || isExam
                      ? formatMinutes(plan?.mode || 50)
                      : rangeLabel(focus)}
                  </h2>
                  <p>
                    {mixed || isExam
                      ? 'Yemek ve molalar bu süreye dâhil değil. Adımların gerçek plan toplamı solda yazıyor.'
                      : 'İlk çalışma için tahmini toplam süre. Anlatım, sorular ve yanlışlarına dönüş dâhil.'}
                  </p>
                  <div className="rule-note">
                    Bir parça: <strong>25 dakika</strong>
                    <br />
                    Ardından: <strong>5 dakika ara</strong>
                  </div>
                  <p>
                    Bir dersi tamamen bitirmeden diğerine geçebilirsin. Önemli
                    olan her çalışmada soru çözmek ve eski bilgilere geri
                    dönmek.
                  </p>
                </div>
                <div className="gentle-note">
                  <h3>Bir gün kaçarsa?</h3>
                  <p>
                    Yapmadığın işler üst üste yığılmaz. İşaretlerin kalır;
                    sıradaki adımdan devam edersin.
                  </p>
                </div>
                <div className="tiny-stats">
                  <span>
                    <strong>{Object.keys(state.done).length}</strong> küçük adım
                  </span>
                  <span>
                    <strong>{completedCount}</strong> konu ilk çalışması
                  </span>
                </div>
              </aside>
            </div>
            <section className="pace-card">
              <h3>27 Eylül’e kadar kendini tüketmeden</h3>
              <div className="pace-grid">
                <div>
                  <span>ŞİMDİ → 27 EYLÜL</span>
                  <strong>İş günü 25–50 dk</strong>
                  <p>
                    İzin gününde 100 dakikayı ikiye böl. İzin gününü kendin seç;
                    takvim tahmin etmiyor.
                  </p>
                </div>
                <div>
                  <span>28 → 30 EYLÜL</span>
                  <strong>Güne yayılmış 4 saat</strong>
                  <p>
                    İşten çıkınca ilk günler bu tempoyla başla. Araları bu
                    süreye ekle.
                  </p>
                </div>
                <div>
                  <span>1 → 22 EKİM</span>
                  <strong>Sürdürebiliyorsan 6 saat</strong>
                  <p>
                    Deneme, eksik konular ve tekrar için de zaman ayır. İstersen
                    kısa gün seçebilirsin. Son iki gün hafif tekrar var.
                  </p>
                </div>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="program">
            <ProgramPanel
              state={state}
              date={date}
              disabled={blocked}
              onToday={() => setTab('today')}
              onApply={(minutes) => {
                safe(
                  change(
                    (s) => ({
                      ...s,
                      plans: {
                        ...s.plans,
                        [date]: makeBalancedPlan(s, date, minutes),
                      },
                    }),
                    'Dengeli program bugüne uygulandı; tiklerin korundu.',
                  ).then(() => setTab('today')),
                );
              }}
              onExam={() => {
                safe(
                  change(
                    (s) => ({
                      ...s,
                      plans: { ...s.plans, [date]: makeExamPlan(s, date) },
                    }),
                    'Bugün deneme günü; bitirdiğin işler korundu.',
                  ).then(() => setTab('today')),
                );
              }}
            />
          </TabsContent>
          <TabsContent value="topics">
            <div className="catalog-intro">
              <h2>Hangi konu, ne kadar süre?</h2>
              <p>
                Süreler sana başlangıç noktası vermek için. Konu anlatımı + ilk
                sorular + yanlışlara dönüşü içerir; bir günde bitirme
                zorunluluğu yok. Buradaki ders sırası önem sırası değil;
                dersleri Programım bölümündeki gibi birlikte ilerlet.
              </p>
            </div>
            <div className="topic-tools">
              <label className="topic-search">
                <Search size={20} />
                <Input
                  aria-label="Konu ara"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Bir konu bul: bölme, paragraf…"
                />
              </label>
              <Select
                value={topicFilter}
                onValueChange={(v) => setTopicFilter(String(v))}
              >
                <SelectTrigger aria-label="Konu görünümünü filtrele">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm konular</SelectItem>
                  <SelectItem value="started">Devam ettiklerim</SelectItem>
                  <SelectItem value="revisit">Tekrar edeceklerim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs
              value={subject}
              onValueChange={(value) => {
                setSubject(String(value));
                setExpanded('');
              }}
            >
              <TabsList className="subject-list">
                {subjects.map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>
              {subjects.map((s) => (
                <TabsContent key={s} value={s}>
                  <div className="catalog-list">
                    {topics
                      .filter(
                        (t) =>
                          t.subject === s && !t.practice && matchesTopic(t),
                      )
                      .map(topicRow)}
                    {!topics.some(
                      (t) => t.subject === s && !t.practice && matchesTopic(t),
                    ) && (
                      <p className="calm-empty">
                        Bu derste seçimine uyan konu yok. Aramayı veya filtreyi
                        değiştirebilirsin.
                      </p>
                    )}
                  </div>
                  {topics.some((t) => t.subject === s && t.practice) && (
                    <details className="practice-group">
                      <summary>
                        Pegem’deki tarama, karma test ve denemeler
                      </summary>
                      <p>
                        Bunlar yeni konu değil. İlgili konuları öğrendikten
                        sonra soru çalışması olarak kullan.
                      </p>
                      {topics
                        .filter((t) => t.subject === s && t.practice)
                        .map(topicRow)}
                    </details>
                  )}
                </TabsContent>
              ))}
            </Tabs>
            <div className="learning-rule">
              <h3>Bir konuyu ne zaman bırakıp ilerleyeyim?</h3>
              <ol>
                <li>Konunun küçük anlatım ve soru adımlarını tamamla.</li>
                <li>
                  Yeni 10 kolay–orta soruda en az 7 doğru yapabiliyorsan ilk
                  çalışmayı bitir. Bu sınava hazır olduğun anlamına gelmez;
                  tekrar gerekecek.
                </li>
                <li>
                  Olmadıysa yalnız takıldığın kısma 25 dakika daha ayır. “Henüz
                  oturmadı” düğmesi bunun için.
                </li>
                <li>
                  Bir sonraki çalışma gününde 10 dakika hatırla. Sonra 3 ve 7
                  gün arayla eski yanlışlarını tekrar çöz.
                </li>
              </ol>
              <p>
                Matematikte doğal sayılardan faktöriyele kadar daha önce
                baktığın bilgisi korundu. O konular otomatik olarak tamamlandı
                sayılmadı.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="progress">
            {date && ready ? (
              <ProgressPanel
                state={state}
                date={date}
                disabled={blocked}
                onSave={change}
                onTopic={openTopic}
              />
            ) : (
              <p className="calm-empty">
                Kayıtların yüklenince ilerlemen burada görünecek.
              </p>
            )}
          </TabsContent>
          <TabsContent value="app">
            <PwaPanel
              installed={pwa.installed}
              online={pwa.online}
              waiting={!!pwa.waiting}
              onUpdate={pwa.update}
              state={state}
              ready={ready}
            />
          </TabsContent>
        </Tabs>
        <div className="footer-notes">
          <p>{notice || 'Küçük bir çalışma da çalışmadır.'}</p>
          <span aria-live="polite">
            {busy
              ? 'Kaydediliyor…'
              : ready
                ? 'Kayıtların bu özel sitede saklanır.'
                : ''}
          </span>
        </div>
        <details className="method-note">
          <summary>Süreler nasıl belirlendi?</summary>
          <p>
            Bu aralıklar kişisel başlangıç tahminidir; öğretmenin video uzunluğu
            veya bilimsel bir öğrenme sınırı değildir. Temel konular çoğunlukla
            1–2,5 saat, daha çok ön bilgi isteyen matematik ve geniş tarih
            konuları 2–5 saat aralığında planlandı. Hızına göre ek çalışma
            koyabilirsin. Bütün listeyi verilen zamanda bitirme garantisi yok;
            ilk denemelerden sonra eksiklerine göre öncelikleri değiştirmek
            gerekir.
          </p>
          <p>
            Pegem’den gönderdiğin 243 bölümün tamamı listede. Numaralı aynı konu
            parçaları bir arada gösterilir. Matematikte iki satıra bölünmüş “1.
            Dereceden Denklemler” tek başlık olarak düzeltildi. Tiklenen süreler
            planlanan çalışma süresidir; otomatik süre ölçümü yapılmaz.
          </p>
          <a
            href="https://osym.gov.tr/2026-kpss-ortaogretim-basvurularin-alinmasi"
            target="_blank"
            rel="noreferrer"
          >
            Sınav tarihi: ÖSYM · 25 Ekim 2026
          </a>
        </details>
      </main>
    </div>
  );
}

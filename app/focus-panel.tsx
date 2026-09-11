'use client';
import { useEffect, useState } from 'react';
import { Play, Pause, Check, Timer, Coffee } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { timerRemaining } from '@/lib/companion';
import { topics, type Step, type StudyState } from '@/lib/study';
export type SaveStudy = (
  update: (s: StudyState) => StudyState,
  message?: string,
) => Promise<unknown>;
export function FocusPanel({
  state,
  date,
  next,
  disabled,
  onSave,
  onComplete,
}: {
  state: StudyState;
  date: string;
  next?: Step;
  disabled: boolean;
  onSave: SaveStudy;
  onComplete: (id: string) => Promise<unknown>;
}) {
  const [now, setNow] = useState(Date.now());
  const [duration, setDuration] = useState('25');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  const t = state.timer;
  const left = t ? timerRemaining(t, now) : Number(duration) * 60;
  const ended = !!t && left === 0;
  const run = async (p: Promise<unknown>) => {
    setMessage('');
    try {
      await p;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'İşlem kaydedilemedi.');
    }
  };
  const start = () =>
    run(
      onSave(
        (s) => ({
          ...s,
          timer: {
            id: crypto.randomUUID(),
            day: date,
            stepId: next?.id || '',
            label: next
              ? `${topics.find((t) => t.id === next.topicId)?.name || 'Çalışma'} · ${next.title}`
              : 'Serbest çalışma',
            duration: Number(duration) * 60,
            remaining: Number(duration) * 60,
            startedAt: Date.now(),
          },
        }),
        'Sayaç başladı.',
      ),
    );
  const toggle = () =>
    run(
      onSave(
        (s) => {
          if (!s.timer) return s;
          return {
            ...s,
            timer: {
              ...s.timer,
              remaining: timerRemaining(s.timer),
              startedAt: s.timer.startedAt === null ? Date.now() : null,
            },
          };
        },
        t?.startedAt === null ? 'Sayaç devam ediyor.' : 'Sayaç duraklatıldı.',
      ),
    );
  const save = () =>
    run(
      onSave((s) => {
        if (!s.timer) return s;
        const seconds = s.timer.duration - timerRemaining(s.timer);
        if (seconds < 1)
          throw new Error('Kaydetmek için en az birkaç saniye çalış.');
        return {
          ...s,
          focusSessions: {
            ...s.focusSessions,
            [s.timer.id]: { day: s.timer.day, seconds, label: s.timer.label },
          },
          timer: null,
        };
      }, 'Sayaç süresi kaydedildi. Konuyu bitirdiysen adımına ayrıca tik koy.'),
    );
  const dayDone = Object.values(state.done).filter((d) => d === date).length;
  return (
    <section className="focus-hero">
      <div className="focus-hero-head">
        <span>
          <span className="live-dot" /> KÂTİPLİK HEDEFİN · BUGÜNKÜ ODAK
        </span>
        <span>{dayDone ? `${dayDone} adım attın` : 'Küçük başla'}</span>
      </div>
      <div className="focus-hero-content">
        <div className="focus-mission">
          <p>
            {t
              ? 'Şu anki çalışman'
              : next
                ? 'Sıradaki küçük adım'
                : 'Bugünkü planın tamam'}
          </p>
          <h2>
            {t
              ? t.label
              : next
                ? topics.find((t) => t.id === next.topicId)?.name || next.title
                : 'Bugün yaptıkların sende kaldı.'}
          </h2>
          <p>
            {t
              ? 'Süre dolunca kendini değerlendir; tikler kendiliğinden tamamlanmaz.'
              : next
                ? next.detail
                : 'İstersen kısa bir tekrar yapabilirsin. Daha fazla süre doldurmak zorunda değilsin.'}
          </p>
          {!t && next && (
            <button
              className="hero-link"
              disabled={disabled}
              onClick={() => run(onComplete(next.id))}
            >
              Bu adımı zaten yaptım <Check size={17} />
            </button>
          )}
        </div>
        <div className="focus-clock">
          <div className="clock-label">
            <Timer size={16} />
            {ended
              ? 'Çalışma süresi doldu'
              : t?.startedAt === null
                ? 'Duraklatıldı'
                : 'Çalışma sayacı'}
          </div>
          <div
            className="clock-digits"
            role="timer"
            aria-label={`${Math.floor(left / 60)} dakika ${left % 60} saniye`}
          >
            {String(Math.floor(left / 60)).padStart(2, '0')}
            <span>:</span>
            {String(left % 60).padStart(2, '0')}
          </div>
          {t ? (
            <>
              <Progress
                value={(1 - left / t.duration) * 100}
                aria-label="Sayaç ilerlemesi"
              />
              <div className="clock-actions">
                {!ended && (
                  <button disabled={disabled} onClick={toggle}>
                    {t.startedAt === null ? (
                      <Play size={18} />
                    ) : (
                      <Pause size={18} />
                    )}{' '}
                    {t.startedAt === null ? 'Devam' : 'Duraklat'}
                  </button>
                )}
                <button disabled={disabled} onClick={save}>
                  <Check size={18} /> Süreyi kaydet
                </button>
              </div>
            </>
          ) : (
            <div className="clock-actions">
              <Select
                value={duration}
                onValueChange={(v) => setDuration(String(v))}
              >
                <SelectTrigger aria-label="Çalışma sayacı süresi">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 15, 25, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} dakika
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                className="start-focus"
                disabled={disabled}
                onClick={start}
              >
                <Play size={19} /> Başla
              </button>
            </div>
          )}
          {ended && (
            <p className="clock-hint" role="status">
              <Coffee size={16} /> 5–10 dakika ara verebilirsin.
            </p>
          )}
        </div>
      </div>
      <div className="focus-hero-footer">
        <span>Hedef: 80 puan · İlerlemeni denemeler gösterecek.</span>
        <span>iPhone kilitliyken alarm garantisi yok.</span>
      </div>
      {message && (
        <p className="focus-error" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}

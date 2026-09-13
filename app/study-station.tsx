'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Check,
  RotateCcw,
  Volume2,
  Coffee,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { timerRemaining, saveTimer, extendTimer } from '@/lib/companion';
import {
  allSteps,
  topics,
  topicVideoUrl,
  teachers,
  type Step,
  type StudyState,
} from '@/lib/study';
import { PracticeQuiz, hasPractice } from './practice-quiz';
import type { SaveStudy } from './focus-panel';

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
  const [now, setNow] = useState(0);
  const [duration, setDuration] = useState('25');
  const [sound, setSound] = useState(true);
  const [soundReady, setSoundReady] = useState(false);
  const [message, setMessage] = useState('');
  const audio = useRef<AudioContext | null>(null);
  const alerted = useRef('');
  const t = state.timer;
  const step = t?.stepId
    ? allSteps(state).find((s) => s.id === t.stepId) ||
      (next?.id === t.stepId ? next : undefined)
    : next;
  const topic = topics.find((x) => x.id === step?.topicId);
  const minutes = Number(duration);
  const validMinutes =
    Number.isInteger(minutes) && minutes >= 1 && minutes <= 180;
  const left = t
    ? timerRemaining(t, now || Date.now())
    : validMinutes
      ? minutes * 60
      : 0;
  const ended = !!t && left === 0;
  useEffect(() => {
    setDuration(String(next?.minutes || 25));
  }, [next?.id, next?.minutes]);
  useEffect(() => {
    try {
      setSound(localStorage.getItem('kpss-alarm-sound') !== 'off');
    } catch {
      /* Device preference only. */
    }
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  const unlockAudio = async () => {
    if (!sound) return;
    try {
      const Audio =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audio.current ||= new Audio();
      await audio.current.resume();
      setSoundReady(audio.current.state === 'running');
    } catch {
      setSoundReady(false);
      setMessage('Ses açılamadı. iPhone Saat uygulamasında sayaç kur.');
    }
  };
  const beep = (count: number) => {
    const ctx = audio.current;
    if (!ctx || ctx.state !== 'running') return;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      const at = ctx.currentTime + i * 0.65;
      osc.frequency.value = i % 2 ? 660 : 880;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.18, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.45);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    }
  };
  useEffect(() => {
    if (!ended || !t || document.visibilityState !== 'visible') return;
    const key = t.id + ':' + t.duration;
    if (alerted.current === key) return;
    alerted.current = key;
    if (sound) beep(5);
  }, [ended, t?.id, t?.duration, now, sound]);
  const run = async (work: () => Promise<unknown>) => {
    setMessage('');
    try {
      await work();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Kaydedilemedi. Yeniden dene.',
      );
    }
  };
  const start = (isBreak = false) => {
    void unlockAudio();
    const seconds = isBreak ? 300 : minutes * 60;
    if (!isBreak && !validMinutes) return;
    void run(() =>
      onSave(
        (s) => ({
          ...saveTimer(s),
          timer: {
            id: crypto.randomUUID(),
            day: date,
            stepId: isBreak ? '' : step?.id || '',
            label: isBreak
              ? '5 dakika mola'
              : `${topic?.name || 'Serbest çalışma'} · ${step?.title || 'Çalışma'}`.slice(
                  0,
                  180,
                ),
            duration: seconds,
            remaining: seconds,
            startedAt: Date.now(),
            kind: isBreak ? 'break' : 'study',
          },
        }),
        isBreak ? 'Mola başladı. Çalışma süresine eklenmez.' : 'Sayaç başladı.',
      ),
    );
  };
  const reset = () =>
    void run(() =>
      onSave(
        (s) =>
          !s.timer
            ? s
            : {
                ...saveTimer(s),
                timer: {
                  ...s.timer,
                  id: crypto.randomUUID(),
                  remaining: s.timer.duration,
                  startedAt: null,
                },
              },
        'Geçen süre saklandı. Sayaç başa alındı; Devam’a bas.',
      ),
    );
  const title =
    t?.kind === 'break'
      ? '5 dakika mola ver'
      : !step
        ? 'Bugünkü plan tamamlandı'
        : step.kind === 'learn'
          ? 'Konu anlatımını izle'
          : step.kind === 'check'
            ? '10 yeni soruda kendini kontrol et'
            : step.kind === 'review'
              ? 'Yanlışlarını yeniden çöz'
              : step.kind === 'paragraph'
                ? 'Paragraf sorularını çöz'
                : step.id.includes('exam')
                  ? step.title
                  : 'Bu konudan 10 soru çöz';
  return (
    <section className="study-station" aria-label="Sıradaki çalışma">
      <div className="mission-bar">
        <span>{t?.kind === 'break' ? 'MOLA' : topic?.subject || 'BUGÜN'}</span>
        <span>{step ? `${step.minutes} dk planlandı` : 'Tamamlandı'}</span>
      </div>
      <div className="station-body">
        <div className="mission-main">
          <p className="mission-topic">
            {topic?.name || step?.title || t?.label || 'Tiklerin kaydedildi.'}
          </p>
          <h2>{title}</h2>
          {t?.kind === 'break' ? (
            <p>Ekrandan uzaklaş, su iç. Süre bitince sıradaki adıma dön.</p>
          ) : step ? (
            <>
              <p className="mission-detail">{step.detail}</p>
              <StepAction
                key={step.id}
                step={step}
                state={state}
                disabled={disabled}
                onSave={onSave}
              />
              <button
                className="mission-complete"
                disabled={disabled}
                onClick={() => void run(() => onComplete(step.id))}
              >
                <Check size={20} />
                {step.kind === 'check'
                  ? 'En az 7 doğru yaptım · konuyu tamamla'
                  : 'Bu adımı bitirdim · sıradakine geç'}
              </button>
              {step.kind === 'check' && (
                <p className="small-info">
                  7’den az doğruysa tikleme: yanlışlarına dön ve 10 farklı
                  soruyla yeniden kontrol et.
                </p>
              )}
            </>
          ) : (
            <p>
              Bugünlük kaydı kapat. Ek çalışma için aşağıdan bugünün planını aç.
            </p>
          )}
        </div>
        <div className="station-timer">
          <p className="timer-status" aria-live="polite">
            {ended
              ? 'Süre doldu'
              : t?.startedAt === null
                ? 'Duraklatıldı'
                : t
                  ? 'Sayaç çalışıyor'
                  : 'Süreyi ayarla ve başlat'}
          </p>
          <div
            role="timer"
            aria-label={`${Math.floor(left / 60)} dakika ${left % 60} saniye`}
            className="timer-number"
          >
            {String(Math.floor(left / 60)).padStart(2, '0')}
            <span>:</span>
            {String(left % 60).padStart(2, '0')}
          </div>
          {!t ? (
            <>
              <label className="duration-input">
                Dakika{' '}
                <Input
                  type="number"
                  min={1}
                  max={180}
                  inputMode="numeric"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </label>
              <div className="timer-presets">
                {[15, 25, 45, 60].map((n) => (
                  <button
                    key={n}
                    aria-pressed={minutes === n}
                    onClick={() => setDuration(String(n))}
                  >
                    {n} dk
                  </button>
                ))}
              </div>
              {!validMinutes && (
                <p role="alert">1–180 arasında tam dakika yaz.</p>
              )}
              <button
                className="timer-primary"
                disabled={disabled || !validMinutes}
                onClick={() => start()}
              >
                <Play size={18} />
                Sayacı başlat
              </button>
            </>
          ) : (
            <>
              <div className="timer-buttons">
                {!ended && (
                  <button
                    disabled={disabled}
                    onClick={() => {
                      void unlockAudio();
                      void run(() =>
                        onSave(
                          (s) =>
                            !s.timer
                              ? s
                              : {
                                  ...s,
                                  timer: {
                                    ...s.timer,
                                    remaining: timerRemaining(s.timer),
                                    startedAt:
                                      s.timer.startedAt === null
                                        ? Date.now()
                                        : null,
                                  },
                                },
                          'Sayaç güncellendi.',
                        ),
                      );
                    }}
                  >
                    {t.startedAt === null ? (
                      <Play size={17} />
                    ) : (
                      <Pause size={17} />
                    )}{' '}
                    {t.startedAt === null ? 'Devam' : 'Duraklat'}
                  </button>
                )}
                <button disabled={disabled} onClick={reset}>
                  <RotateCcw size={17} />
                  Sıfırla
                </button>
                <button
                  disabled={disabled || t.duration >= 10800}
                  onClick={() => {
                    void unlockAudio();
                    void run(() =>
                      onSave(
                        (s) =>
                          !s.timer
                            ? s
                            : { ...s, timer: extendTimer(s.timer, 600) },
                        '10 dakika eklendi.',
                      ),
                    );
                  }}
                >
                  <Plus size={17} />
                  10 dk ekle
                </button>
              </div>
              <button
                className="timer-primary"
                disabled={disabled}
                onClick={() =>
                  void run(() =>
                    onSave(
                      (s) => saveTimer(s),
                      'Süre kaydedildi. Adımın tiki değişmedi.',
                    ),
                  )
                }
              >
                Sayacı bitir ve süreyi kaydet
              </button>
              <p className="small-info">
                Sıfırla: geçen süre saklanır, sayaç aynı süreden duraklatılmış
                olarak başlar.
              </p>
            </>
          )}
          <button
            className="break-button"
            disabled={disabled}
            onClick={() => start(true)}
          >
            <Coffee size={17} />5 dakika mola başlat
          </button>
          <div className="sound-controls">
            <label>
              <Checkbox
                checked={sound}
                onCheckedChange={(value) => {
                  setSound(!!value);
                  try {
                    localStorage.setItem(
                      'kpss-alarm-sound',
                      value ? 'on' : 'off',
                    );
                  } catch {}
                }}
              />
              Süre bitince ses
            </label>
            <button
              onClick={() => {
                void unlockAudio().then(() => beep(2));
              }}
              disabled={!sound}
            >
              <Volume2 size={17} />
              Sesi dene
            </button>
          </div>
          <p className="sound-warning">
            {sound
              ? soundReady
                ? 'Ses bu sayfada hazır.'
                : 'Ses için Başlat’a veya Sesi dene’ye dokun.'
              : 'Ses kapalı.'}{' '}
            YouTube’a geçerken veya ekranı kilitlerken iPhone’un Saat → Sayaç
            bölümünde de alarm kur. Arka planda bu sayfanın sesi garanti değil.
          </p>
        </div>
      </div>
      {message && (
        <p className="station-error" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}

function StepAction({
  step,
  state,
  disabled,
  onSave,
}: {
  step: Step;
  state: StudyState;
  disabled: boolean;
  onSave: SaveStudy;
}) {
  const topic = topics.find((t) => t.id === step.topicId);
  const [position, setPosition] = useState(
    String(Math.floor((state.videoPositions?.[step.topicId] || 0) / 60)),
  );
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(false);
  if (!topic) return <p className="action-instruction">{step.detail}</p>;
  const video = topicVideoUrl(topic),
    exact = video.includes('/watch?');
  const index = Number(step.id.match(/-(\d+)$/)?.[1] || 0);
  const book = topic.book[Math.min(index, topic.book.length - 1)];
  if (step.kind === 'learn')
    return (
      <div className="step-action">
        <a
          className="action-primary"
          href={
            video +
            (exact ? `&t=${state.videoPositions?.[topic.id] || 0}s` : '')
          }
          target="_blank"
          rel="noreferrer"
        >
          <Play size={20} />
          {exact ? 'Konu videosunu aç' : 'Konuya ait video aramasını aç'}
          <ExternalLink size={16} />
        </a>
        <p className="small-info">
          {teachers[topic.subject]?.name}
          {!exact &&
            ' · Bu başlık için doğrulanmış tek video yok; bağlantı konuya özel aramadır.'}
        </p>
        <details className="video-bookmark">
          <summary>Videoda kaldığın dakikayı kaydet</summary>
          <label>
            Dakika{' '}
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={600}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </label>
          <button
            disabled={disabled}
            onClick={async () => {
              const n = Number(position);
              if (!Number.isInteger(n) || n < 0 || n > 600) {
                setError('0–600 arasında bir dakika yaz.');
                return;
              }
              try {
                await onSave(
                  (s) => ({
                    ...s,
                    videoPositions: { ...s.videoPositions, [topic.id]: n * 60 },
                  }),
                  'Videodaki yerin kaydedildi.',
                );
                setError('Kaydedildi.');
              } catch {
                setError('Kaydedilemedi; tekrar dene.');
              }
            }}
          >
            Yeri kaydet
          </button>
          <p role="status">{error}</p>
        </details>
      </div>
    );
  if (step.kind === 'review')
    return (
      <div className="action-instruction">
        <strong>Pegem → {book.label}</strong>
        <p>
          İşaretlediğin yanlışlardan 3 soru seç. Çözümü kapatıp yeniden çöz;
          takıldığın kuralı Konular bölümündeki notuna yaz.
        </p>
      </div>
    );
  return (
    <div className="step-action">
      <div className="action-instruction">
        <strong>Pegem → {book.label}</strong>
        <p>
          {step.kind === 'check'
            ? 'Daha önce çözmediğin 10 soru seç. Çözümüne bakmadan bitir, sonra cevap anahtarıyla kontrol et.'
            : 'Bu başlıkta henüz çözmediğin ilk 10 soruyu çöz. 15 dakika sonunda kontrol et; boş ve yanlışlarını işaretle.'}
        </p>
        <p className="small-info">
          Kitabının sayfa numaraları elimde yok; bu yüzden başlıkla
          yönlendiriyorum.
        </p>
      </div>
      {step.kind !== 'check' && hasPractice(topic.id) && (
        <>
          <button className="action-primary" onClick={() => setQuiz(!quiz)}>
            {quiz ? 'Alıştırmayı kapat' : 'Burada 10 alıştırma sorusu çöz'}
          </button>
          {quiz && (
            <PracticeQuiz
              topicId={topic.id}
              state={state}
              disabled={disabled}
              onSave={onSave}
            />
          )}
        </>
      )}
    </div>
  );
}

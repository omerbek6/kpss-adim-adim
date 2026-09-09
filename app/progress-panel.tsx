'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  TrendingUp,
  BookOpen,
  Check,
  PenLine,
  ArrowUpRight,
} from 'lucide-react';
import {
  examSections,
  examNet,
  weekMinutes,
  type ExamResult,
} from '@/lib/companion';
import {
  topics,
  subjects,
  completed,
  topicSteps,
  type StudyState,
} from '@/lib/study';
import type { SaveStudy } from './focus-panel';
const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
export function ProgressPanel({
  state,
  date,
  disabled,
  onSave,
  onTopic,
}: {
  state: StudyState;
  date: string;
  disabled: boolean;
  onSave: SaveStudy;
  onTopic: (id: string) => void;
}) {
  const fresh = (): ExamResult => ({
    id: crypto.randomUUID(),
    day: date,
    name: '',
    scores: examSections.map(() => ({ right: 0, wrong: 0 })),
    note: '',
  });
  const [draft, setDraft] = useState<ExamResult | null>(null);
  const [message, setMessage] = useState('');
  const days = weekMinutes(state, date);
  const max = Math.max(30, ...days.map((d) => d.minutes));
  const sessions = Object.values(state.focusSessions || {});
  const minutes = Math.round(sessions.reduce((n, s) => n + s.seconds, 0) / 60);
  const studiedDays = new Set([
    ...Object.values(state.done),
    ...sessions.map((s) => s.day),
  ]).size;
  const exams = [...(state.exams || [])].sort((a, b) =>
    a.day.localeCompare(b.day),
  );
  const latest = exams.at(-1);
  const previous = exams.at(-2);
  const finished = topics.filter(
    (t) => !t.practice && completed(t, state),
  ).length;
  const milestones = [
    {
      label: 'İlk adım',
      hint: 'Bir çalışma adımını işaretle',
      done: Object.keys(state.done).length > 0,
    },
    {
      label: '3 ayrı gün',
      hint: 'Üç farklı gün bir adım at',
      done: studiedDays >= 3,
    },
    {
      label: '100 dakika',
      hint: 'Sayaçta 100 dakika biriktir',
      done: minutes >= 100,
    },
    {
      label: 'İlk deneme',
      hint: 'Bir deneme sonucunu kaydet',
      done: exams.length > 0,
    },
  ];
  const saveExam = async () => {
    if (!draft) return;
    setMessage('');
    if (!draft.name.trim()) {
      setMessage('Denemene bir isim yaz.');
      return;
    }
    if (
      draft.scores.some((s, i) => s.right + s.wrong > examSections[i].count)
    ) {
      setMessage('Doğru ve yanlış toplamı o dersin soru sayısını aşamaz.');
      return;
    }
    try {
      const entry = { ...draft, name: draft.name.trim() };
      await onSave(
        (s) => ({
          ...s,
          exams: (s.exams || []).some((e) => e.id === entry.id)
            ? s.exams!.map((e) => (e.id === entry.id ? entry : e))
            : [...(s.exams || []), entry],
        }),
        'Deneme sonucu kaydedildi.',
      );
      setDraft(null);
      setMessage(
        'Denemen kaydedildi. Sonraki çalışmanda en çok takıldığın iki konuya dön.',
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Deneme kaydedilemedi.');
    }
  };
  return (
    <div className="progress-panel">
      <div className="section-heading">
        <p className="eyebrow">DÜNÜ TELAFİ ETMEK DEĞİL, BUGÜNÜ GÖRMEK</p>
        <h2>İlerlemen burada birikiyor.</h2>
        <p>
          Buradaki sayılar yaptığın çalışmayı gösterir; sınava hazır olma
          yüzdesi değildir.
        </p>
      </div>
      <div className="metric-grid">
        <article>
          <span>Sayaçta biriken</span>
          <strong>
            {minutes}
            <small> dakika</small>
          </strong>
          <p>{sessions.length} kayıtlı çalışma</p>
        </article>
        <article>
          <span>Çalıştığın gün</span>
          <strong>{studiedDays}</strong>
          <p>Ardışık olmak zorunda değil</p>
        </article>
        <article>
          <span>İlk çalışması biten konu</span>
          <strong>{finished}</strong>
          <p>Tekrarlarla güçlenecek</p>
        </article>
      </div>
      <section className="surface-card">
        <div className="section-heading-row">
          <div>
            <h3>Son 7 gün</h3>
            <p>
              Sayaçta kaydettiğin dakika. Tiklerin tahmini süreleri buna
              eklenmez.
            </p>
          </div>
          <TrendingUp size={24} />
        </div>
        <div
          className="week-chart"
          role="list"
          aria-label="Son yedi günün sayaç süreleri"
        >
          {days.map((d) => (
            <div
              role="listitem"
              key={d.day}
              aria-label={`${d.day}: ${d.minutes} dakika`}
            >
              <span>{d.minutes}</span>
              <div className="bar-track">
                <div
                  style={{ height: Math.max(3, (d.minutes / max) * 100) + '%' }}
                />
              </div>
              <small>
                {new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(
                  new Date(d.day + 'T12:00:00Z'),
                )}
              </small>
            </div>
          ))}
        </div>
        <p className="supportive-line">
          Boş bir gün önceki emeğini silmez. Sonraki küçük adım hâlâ değerli.
        </p>
      </section>
      <div className="milestone-grid">
        {milestones.map((m) => (
          <article key={m.label} className={m.done ? 'earned' : ''}>
            <Award size={24} />
            <strong>{m.label}</strong>
            <span>{m.done ? 'Senin kazanımın' : m.hint}</span>
          </article>
        ))}
      </div>
      <section className="surface-card">
        <h3>Dersler birlikte ilerlesin</h3>
        <div className="subject-progress-list">
          {subjects.map((subject) => {
            const list = topics.filter(
              (t) => t.subject === subject && !t.practice,
            );
            const done = list.filter((t) => completed(t, state)).length;
            return (
              <div key={subject}>
                <div>
                  <strong>{subject}</strong>
                  <span>
                    {done} / {list.length} konu
                  </span>
                </div>
                <Progress
                  value={(done / list.length) * 100}
                  aria-label={subject + ' ilk çalışma ilerlemesi'}
                />
              </div>
            );
          })}
        </div>
      </section>
      <section className="surface-card">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">HEDEF PUANI DEĞİL, GERÇEK NETLERİ İZLE</p>
            <h3>Deneme defterin</h3>
          </div>
          <button
            className="primary-btn"
            disabled={disabled || (state.exams?.length || 0) >= 100}
            onClick={() => {
              setDraft(fresh());
              setMessage('');
            }}
          >
            <PenLine size={17} /> Sonuç ekle
          </button>
        </div>
        {latest ? (
          <div className="latest-exam">
            <div>
              <span>Son deneme · {latest.name}</span>
              <strong>
                {fmt(examNet(latest))}
                <small> net</small>
              </strong>
            </div>
            <p>
              {previous
                ? `${previous.name} denemesine göre ${fmt(examNet(latest) - examNet(previous))} net fark. Denemelerin zorluğu aynı olmayabilir.`
                : 'İlk ölçümün kaydedildi. Sonraki denemeyle karşılaştırabileceksin.'}
            </p>
          </div>
        ) : (
          <div className="calm-empty">
            <BookOpen size={30} />
            <p>
              Henüz deneme sonucun yok. Konular bitmeden de bir deneme
              çözebilirsin; ilk sonuç başlangıç noktan olacak.
            </p>
          </div>
        )}
        {draft && (
          <form
            className="exam-form"
            onSubmit={(e) => {
              e.preventDefault();
              void saveExam();
            }}
          >
            <div className="form-two">
              <label>
                Denemenin adı
                <Input
                  value={draft.name}
                  maxLength={80}
                  required
                  placeholder="Örn. Pegem 1. deneme"
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Tarih
                <Input
                  type="date"
                  value={draft.day}
                  max={date}
                  required
                  onChange={(e) => setDraft({ ...draft, day: e.target.value })}
                />
              </label>
            </div>
            <p className="field-hint">
              Standart 120 soruluk dağılım için. Matematik ve geometri
              sonuçlarını birlikte gir.
            </p>
            <div className="exam-score-head">
              <span>Ders</span>
              <span>Doğru</span>
              <span>Yanlış</span>
              <span>Net</span>
            </div>
            {examSections.map((section, i) => (
              <div className="exam-score-row" key={section.name}>
                <label>
                  {section.name}
                  <small>{section.count} soru</small>
                </label>
                {(['right', 'wrong'] as const).map((key) => (
                  <Input
                    key={key}
                    type="number"
                    min={0}
                    max={section.count}
                    step={1}
                    inputMode="numeric"
                    aria-label={`${section.name} ${key === 'right' ? 'doğru' : 'yanlış'}`}
                    value={draft.scores[i][key]}
                    onChange={(e) => {
                      const scores = draft.scores.map((s, j) =>
                        j === i ? { ...s, [key]: Number(e.target.value) } : s,
                      );
                      setDraft({ ...draft, scores });
                    }}
                    required
                  />
                ))}
                <strong>
                  {fmt(draft.scores[i].right - draft.scores[i].wrong / 4)}
                </strong>
              </div>
            ))}
            <label>
              Bu denemeden öğrendiğim
              <Textarea
                value={draft.note}
                maxLength={600}
                placeholder="En çok nerede takıldın? Bir sonraki çalışmada neyi değiştireceksin?"
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </label>
            <div className="form-footer">
              <strong>Toplam: {fmt(examNet(draft))} net</strong>
              <button
                type="button"
                className="plain-btn"
                onClick={() => setDraft(null)}
              >
                Vazgeç
              </button>
              <button className="primary-btn" disabled={disabled}>
                Kaydet <Check size={17} />
              </button>
            </div>
          </form>
        )}
        {message && (
          <p className="inline-feedback" role="status">
            {message}
          </p>
        )}
        <div className="exam-history">
          {[...exams].reverse().map((e) => (
            <details key={e.id}>
              <summary>
                <span>
                  {e.name}
                  <small>{e.day.split('-').reverse().join('.')}</small>
                </span>
                <strong>{fmt(examNet(e))} net</strong>
              </summary>
              <div>
                {e.scores.map((s, i) => (
                  <p key={i}>
                    {examSections[i].name}:{' '}
                    <strong>{fmt(s.right - s.wrong / 4)} net</strong> ·{' '}
                    {s.right} doğru, {s.wrong} yanlış,{' '}
                    {examSections[i].count - s.right - s.wrong} boş
                  </p>
                ))}
                {e.note && <blockquote>{e.note}</blockquote>}
                <button
                  className="plain-btn"
                  disabled={disabled}
                  onClick={() => {
                    setDraft(structuredClone(e));
                    setMessage('');
                  }}
                >
                  Bu sonucu düzelt <PenLine size={15} />
                </button>
              </div>
            </details>
          ))}
        </div>
        <p className="field-hint">
          Net = doğru − yanlış ÷ 4. Netlerden kesin KPSS puanı hesaplamıyoruz;
          puanlama sınavın sonuç dağılımına bağlıdır.
        </p>
      </section>
      <section className="surface-card">
        <h3>Geri döneceğim konular</h3>
        <p>
          Konularda “Tekrar etmeliyim” diye işaretlediklerin ve kısa notların.
        </p>
        {topics.filter(
          (t) => state.favorites?.includes(t.id) || state.notes?.[t.id],
        ).length ? (
          topics
            .filter(
              (t) => state.favorites?.includes(t.id) || state.notes?.[t.id],
            )
            .map((t) => (
              <button
                className="saved-topic"
                key={t.id}
                onClick={() => onTopic(t.id)}
              >
                <span>
                  <strong>{t.name}</strong>
                  <small>
                    {state.notes?.[t.id] || 'Tekrar etmek için işaretledin.'}
                  </small>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))
        ) : (
          <p className="calm-empty">
            Takıldığın bir konuda kısa not bırak; sonraki çalışmada buradan
            ulaş.
          </p>
        )}
      </section>
    </div>
  );
}

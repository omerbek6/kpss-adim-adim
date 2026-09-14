'use client';
import { useEffect, useRef, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { questionBanks } from '@/lib/question-bank';
import {
  bankProgress,
  blankRecord,
  updateBank,
  updateQuestion,
  checkAnswer,
  revealAnswer,
  retryQuestion,
  quizStats,
} from '@/lib/quiz-state';
import type { StudyState } from '@/lib/study';
import type { SaveStudy } from './focus-panel';
export { hasPractice } from '@/lib/question-bank';

export function PracticeQuiz({
  topicId,
  state,
  disabled,
  onSave,
}: {
  topicId: string;
  state: StudyState;
  disabled: boolean;
  onSave: SaveStudy;
}) {
  const bank = questionBanks[topicId];
  const p = bankProgress(state, topicId);
  const q = bank.questions.find((q) => q.id === p.questionId)!;
  const record = p.records[q.id] || blankRecord();
  const pack = bank.packs.find((b) => b.id === p.packId);
  const mistakes = bank.questions
    .filter((q) => p.records[q.id]?.needsReview)
    .map((q) => q.id);
  const ids =
    pack?.ids ||
    bank.questions
      .filter((q) => mistakes.includes(q.id) || q.id === p.questionId)
      .map((q) => q.id);
  const index = ids.indexOf(q.id);
  const stats = quizStats(p);
  const completed = ids.filter((id) => p.records[id]?.first).length;
  const packIndex = bank.packs.findIndex((b) => b.id === p.packId);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousId = useRef(q.id);
  const blocked = disabled || saving;
  useEffect(() => {
    if (previousId.current !== q.id) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start' });
    }
    previousId.current = q.id;
  }, [q.id]);
  const save = async (
    update: (s: StudyState) => StudyState,
    message?: string,
  ) => {
    if (lock.current || disabled) return;
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      await onSave(update, message);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Kaydedilemedi. İnternetini kontrol edip aynı işlemi tekrar dene.',
      );
    } finally {
      lock.current = false;
      setSaving(false);
    }
  };
  const move = (id: string, packId = p.packId) =>
    save((s) =>
      updateBank(s, topicId, (p) => ({ ...p, questionId: id, packId })),
    );
  const choosePack = (packId: string) => {
    const targetIds =
      packId === 'mistakes'
        ? mistakes
        : bank.packs.find((b) => b.id === packId)!.ids;
    const target =
      targetIds.find((id) => !p.records[id]?.first) || targetIds[0];
    if (target) void move(target, packId);
  };
  return (
    <section
      className="practice-quiz guided-quiz"
      aria-label={bank.title + ' soru çalışması'}
    >
      <p className="small-info">
        Özgün sorular · AI/API kredisi harcamaz · kayıt için internet gerekir.
      </p>
      <div className="quiz-summary">
        <div>
          <strong>
            {stats.studied}/{bank.questions.length}
          </strong>
          <span>soruya çalıştın</span>
        </div>
        <div>
          <strong>
            {stats.percentage === null ? '—' : `%${stats.percentage}`}
          </strong>
          <span>ilk çalışma başarısı</span>
        </div>
        <div>
          <strong>{stats.review}</strong>
          <span>tekrar edilecek</span>
        </div>
      </div>
      <Progress
        value={(stats.studied * 100) / bank.questions.length}
        aria-label="Soru bankası ilerlemesi"
      />
      <details className="quiz-score-note">
        <summary>Sonuçlarım ve başarı yüzdesi</summary>
        <p>
          İlk çalışma: {stats.correct} doğru · {stats.wrong} yanlış ·{' '}
          {stats.assisted} çözümle öğrenme. Önceden çözümünü açtığın soru doğru
          sayılmaz; tekrarlar ilk sonucu değiştirmez. Bu yüzde KPSS puanı
          değildir.
        </p>
      </details>
      <details className="quiz-pack-picker">
        <summary>
          Seti değiştir · {pack?.title || 'Yanlışlarım ve yardım aldıklarım'}
        </summary>
        <div className="quiz-pack-buttons">
          {bank.packs.map((b) => (
            <button
              key={b.id}
              disabled={blocked}
              aria-pressed={p.packId === b.id}
              onClick={() => choosePack(b.id)}
            >
              {b.title}
              <span>
                {b.ids.filter((id) => p.records[id]?.first).length}/
                {b.ids.length} çalışıldı
              </span>
            </button>
          ))}
        </div>
      </details>
      <button
        className="quiz-review-button"
        disabled={blocked || mistakes.length === 0}
        aria-pressed={p.packId === 'mistakes'}
        onClick={() => choosePack('mistakes')}
      >
        Yanlışlarımı ve yardım aldıklarımı aç · {mistakes.length}
      </button>
      <p className="quiz-guidance">
        {pack?.note ||
          'Her soru için “Çözümü kapatıp yeniden dene”ye bas. Yardım almadan doğru çözdüğünde tekrar listesinden çıkar; eski yanlışın kaybolmaz.'}
      </p>
      <div className="quiz-head">
        <strong>
          Soru {bank.questions.indexOf(q) + 1} / {bank.questions.length}
        </strong>
        <span>
          {pack ? `Bu sette ${completed}/${ids.length}` : 'Tekrar çalışması'}
        </span>
      </div>
      <p className="quiz-skill">{q.skill}</p>
      <h3 ref={heading} tabIndex={-1}>
        {q.q}
      </h3>
      <RadioGroup
        aria-label="Cevap seçenekleri"
        className="quiz-choice-list"
        value={record.choice === null ? '' : String(record.choice)}
        disabled={blocked || record.checked}
        onValueChange={(value) => {
          if (value !== '')
            void save((s) =>
              updateQuestion(s, topicId, q.id, (r) =>
                r.checked ? r : { ...r, choice: Number(value) },
              ),
            );
        }}
      >
        {q.options.map((option, i) => (
          <label
            key={i}
            className={
              'quiz-choice' +
              (record.choice === i ? ' selected' : '') +
              (record.checked && record.choice === i
                ? record.choice === q.answer
                  ? ' correct'
                  : ' wrong'
                : '')
            }
          >
            <RadioGroupItem value={String(i)} />
            <span>
              <b>{String.fromCharCode(65 + i)}.</b> {option}
            </span>
          </label>
        ))}
      </RadioGroup>
      {!record.checked && (
        <button
          className="quiz-check"
          disabled={blocked || record.choice === null}
          onClick={() =>
            void save(
              (s) => updateQuestion(s, topicId, q.id, checkAnswer),
              'Cevabın kontrol edildi ve kaydedildi.',
            )
          }
        >
          Cevabımı kontrol et
        </button>
      )}
      {record.checked && (
        <p
          className={
            'quiz-result ' +
            (record.choice === q.answer ? 'is-correct' : 'is-wrong')
          }
          role="status"
        >
          {record.choice === q.answer
            ? record.helped
              ? 'Cevap doğru; bu denemede çözümden yardım aldın.'
              : 'Doğru cevap.'
            : 'Bu cevap yanlış. Tekrar listene kaydedildi.'}
          {record.attempts > 1 && (
            <>
              {' '}
              Bu soruyu {record.attempts} kez kontrol ettin; {record.wrong}{' '}
              yanlış kaydı var.
            </>
          )}
          {record.checked &&
            !record.helped &&
            record.choice === q.answer &&
            record.first !== 'correct' && (
              <> Yardım almadan doğru çözdün; tekrar listesinden çıktı.</>
            )}
        </p>
      )}
      {record.revealed ? (
        <div className="quiz-explanation">
          <strong>
            Doğru cevap: {String.fromCharCode(65 + q.answer)} ·{' '}
            {q.options[q.answer]}
          </strong>
          <p>{q.explanation}</p>
        </div>
      ) : (
        <button
          className="quiz-help"
          disabled={blocked}
          onClick={() =>
            void save(
              (s) => updateQuestion(s, topicId, q.id, revealAnswer),
              'Çözüm açıldı. Gerekirse tekrar listende bulabilirsin.',
            )
          }
        >
          {record.checked ? 'Çözümü göster' : 'Takıldım · çözümü göster'}
        </button>
      )}
      {!record.checked && !record.revealed && (
        <p className="small-info">
          Seçimini değiştirebilirsin. Kontrol etmeden doğru/yanlış gösterilmez.
          Takıldıysan çözümü aç; bu soru tekrar listene eklenir.
        </p>
      )}
      {(record.checked || record.revealed) && (
        <button
          className="quiz-retry"
          disabled={blocked}
          onClick={() =>
            void save(
              (s) => updateQuestion(s, topicId, q.id, retryQuestion),
              'Çözüm kapatıldı. Şimdi kâğıtta yeniden çöz.',
            )
          }
        >
          Çözümü kapatıp yeniden dene
        </button>
      )}
      {saving && (
        <p role="status" className="small-info">
          Kaydediliyor…
        </p>
      )}
      {error && (
        <p className="quiz-error" role="alert">
          {error}
        </p>
      )}
      <div className="quiz-nav">
        <button
          disabled={blocked || index <= 0}
          onClick={() => void move(ids[index - 1])}
        >
          Önceki soru
        </button>
        <button
          disabled={blocked || index >= ids.length - 1}
          onClick={() => void move(ids[index + 1])}
        >
          {!record.first ? 'Şimdilik geç' : 'Sonraki soru'}
        </button>
      </div>
      {pack && index === ids.length - 1 && completed < ids.length && (
        <button
          className="quiz-help"
          disabled={blocked}
          onClick={() => void move(ids.find((id) => !p.records[id]?.first)!)}
        >
          Bu sette boş bıraktığım soruya dön
        </button>
      )}
      {!pack && mistakes.length === 0 && (
        <div className="quiz-pack-complete">
          <strong>Tekrar listende bekleyen soru kalmadı.</strong>
          <button
            disabled={blocked}
            onClick={() =>
              choosePack(
                bank.packs.find((b) =>
                  b.ids.some((id) => !p.records[id]?.first),
                )?.id || bank.packs[0].id,
              )
            }
          >
            Soru setlerine dön
          </button>
        </div>
      )}
      {pack && completed === ids.length && (
        <div className="quiz-pack-complete">
          <strong>Bu setteki {ids.length} soruya çalıştın.</strong>
          <p>
            {ids.some((id) => p.records[id]?.needsReview)
              ? 'Yanlışlarını ve yardım aldığın soruları, çözümü kapatarak tekrar et. Bugün burada durabilirsin.'
              : 'Bu sette bekleyen tekrar yok. Bugün burada durabilir veya sonraki sete geçebilirsin.'}
          </p>
          {bank.packs[packIndex + 1] && (
            <button
              disabled={blocked}
              onClick={() => choosePack(bank.packs[packIndex + 1].id)}
            >
              {bank.packs[packIndex + 1].title}
            </button>
          )}
        </div>
      )}
      <details className="quiz-score-note">
        <summary>Kayıtlar ve günlük plan hakkında</summary>
        <p>
          Tüm soruları bir oturuşta bitirmen gerekmiyor. Kaldığın soru, seçimin
          ve sonuçların hesabında saklanır. Bu çalışma günlük tiklerini ve “10
          yeni soruda kontrol” adımını kendiliğinden tamamlamaz. Sorular
          özgündür; ÖSYM/Pegem’den alınmadı. Soru çözmek ve açıklama açmak yapay
          zekâ çağrısı yapmaz.
        </p>
      </details>
    </section>
  );
}

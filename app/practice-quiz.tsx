'use client';
import { useState } from 'react';
import { practice } from '@/lib/practice';
import type { StudyState } from '@/lib/study';
import type { SaveStudy } from './focus-panel';
export const hasPractice = (id: string) => !!practice[id];
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
  const questions = practice[topicId] || [];
  const answers = state.practiceAnswers?.[topicId] || [];
  const first = questions.findIndex(
    (_, i) => answers[i] === undefined || answers[i] === -1,
  );
  const [index, setIndex] = useState(first < 0 ? 0 : first);
  const [error, setError] = useState('');
  const q = questions[index];
  if (!q) return null;
  const selected = answers[index] ?? -1;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const done = answers.filter((a) => a >= 0).length;
  return (
    <section className="practice-quiz" aria-label="10 soruluk alıştırma">
      <p className="small-info">
        Özgün temel alıştırmalar · Pegem/ÖSYM sorusu değildir. Cevapların
        hesabına kaydedilir. Bu set konu bitirme testi değildir.
      </p>
      <div className="quiz-head">
        <strong>
          Soru {index + 1} / {questions.length}
        </strong>
        <span>
          {done} çözüldü · {correct} doğru
        </span>
      </div>
      <h3>{q.q}</h3>
      <div className="quiz-options">
        {q.options.map((option, i) => (
          <button
            key={i}
            className={
              selected !== -1 && i === q.answer
                ? 'correct'
                : selected === i
                  ? 'wrong'
                  : ''
            }
            disabled={disabled || selected !== -1}
            onClick={async () => {
              setError('');
              try {
                await onSave((s) => {
                  const saved = [
                    ...(s.practiceAnswers?.[topicId] || Array(10).fill(-1)),
                  ];
                  saved[index] = i;
                  return {
                    ...s,
                    practiceAnswers: { ...s.practiceAnswers, [topicId]: saved },
                  };
                }, 'Cevabın kaydedildi.');
              } catch {
                setError('Cevap kaydedilemedi. Tekrar dokun.');
              }
            }}
          >
            {String.fromCharCode(65 + i)}. {option}
          </button>
        ))}
      </div>
      {selected !== -1 && (
        <p className="quiz-explanation" role="status">
          <strong>
            {selected === q.answer
              ? 'Doğru.'
              : `Doğru cevap: ${String.fromCharCode(65 + q.answer)}.`}
          </strong>{' '}
          {q.explanation}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="quiz-nav">
        <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Önceki soru
        </button>
        <button
          disabled={index === questions.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Sonraki soru
        </button>
      </div>
      {done === 10 && (
        <p className="quiz-explanation">
          Set tamamlandı: {correct}/10 doğru. Yanlışların çözümünü kapatıp
          kâğıtta yeniden çöz. Konu kontrolünü Pegem’den 10 yeni soruyla yap.
        </p>
      )}
    </section>
  );
}

'use client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Topic, StudyState } from '@/lib/study';
import type { SaveStudy } from './focus-panel';
export function TopicNotes({
  topic,
  state,
  disabled,
  onSave,
}: {
  topic: Topic;
  state: StudyState;
  disabled: boolean;
  onSave: SaveStudy;
}) {
  const [text, setText] = useState(state.notes?.[topic.id] || '');
  const [message, setMessage] = useState('');
  const run = async (p: Promise<unknown>) => {
    setMessage('');
    try {
      await p;
      setMessage('Kaydedildi.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Not kaydedilemedi.');
    }
  };
  return (
    <section className="topic-notes">
      <label className="favorite-toggle">
        <Checkbox
          checked={state.favorites?.includes(topic.id) || false}
          disabled={disabled}
          onCheckedChange={(v) =>
            void run(
              onSave(
                (s) => ({
                  ...s,
                  favorites: v
                    ? [...new Set([...(s.favorites || []), topic.id])]
                    : (s.favorites || []).filter((id) => id !== topic.id),
                }),
                'Tekrar listesi güncellendi.',
              ),
            )
          }
        />{' '}
        Bu konuya tekrar dönmeliyim
      </label>
      <label htmlFor={'note-' + topic.id}>Burada neye takıldım?</label>
      <Textarea
        id={'note-' + topic.id}
        value={text}
        maxLength={600}
        onChange={(e) => setText(e.target.value)}
        placeholder="Örn. 9’a bölünebilmede rakamları toplarken hata yapıyorum. Pegem sayfa 42, soru 6’ya döneceğim."
      />
      <div>
        <small>{text.length} / 600</small>
        <button
          className="primary-btn"
          disabled={disabled}
          onClick={() =>
            void run(
              onSave(
                (s) => ({ ...s, notes: { ...s.notes, [topic.id]: text } }),
                'Konu notu kaydedildi.',
              ),
            )
          }
        >
          Notumu kaydet
        </button>
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}

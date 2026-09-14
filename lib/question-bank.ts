import { practice, type Question } from './practice';
import divisionAdditions from './questions/division.json';

export type BankQuestion = Question & { id: string; skill: string };
export type QuestionPack = {
  id: string;
  title: string;
  note: string;
  ids: string[];
};
export type QuestionBank = {
  topicId: string;
  title: string;
  questions: BankQuestion[];
  packs: QuestionPack[];
};

// Stable question IDs are part of saved progress. Never reuse an ID for a different question.
// To add EBOB–EKOK or another topic: register its static questions and packs here.
const division = [
  ...practice['s0-7'].map((q, i) => ({
    ...q,
    id: `bolme-${i + 1}`,
    skill: 'Bölme ve bölünebilme temeli',
  })),
  ...divisionAdditions,
];
const pack = (
  id: string,
  title: string,
  note: string,
  start: number,
  end: number,
): QuestionPack => ({
  id,
  title,
  note,
  ids: division.slice(start - 1, end).map((q) => q.id),
});
export const questionBanks: Record<string, QuestionBank> = {
  's0-7': {
    topicId: 's0-7',
    title: 'Bölme – Bölünebilme',
    questions: division,
    packs: [
      pack(
        'temel-1',
        '1. Temeli kur · 10 soru',
        '15–25 dakika ayır. Hız tutma; işlemleri kâğıda yaz. Bu bir başlangıç tahmini, son süre değil.',
        1,
        10,
      ),
      pack(
        'temel-2',
        '2. Temeli pekiştir · 10 soru',
        '20–30 dakika ayır. İlk sette takıldığın kuralı hatırlayıp devam et.',
        11,
        20,
      ),
      pack(
        'sinav-1',
        '3. Sınav tarzı · 10 soru',
        '20–30 dakika ayır. Önce kendi çözümünü dene, sonra kontrol et.',
        21,
        30,
      ),
      pack(
        'sinav-2',
        '4. Sınav tarzı · 5 soru',
        '15–20 dakika ayır. Yanlışın varsa yeni setten önce tekrar listesine dön.',
        31,
        35,
      ),
      pack(
        'zor',
        '5. Zor · 5 soru · en sona bırak',
        'İsteğe bağlı 20–30 dakika. İlk 35 soruda zorlanıyorsan bunu şimdi geç; önce temelini sağlamlaştır.',
        36,
        40,
      ),
    ],
  },
  ...Object.fromEntries(
    ['s0-9', 's0-18'].map((topicId) => {
      const questions = practice[topicId].map((q, i) => ({
        ...q,
        id: `${topicId}-${i + 1}`,
        skill: 'Temel alıştırma',
      }));
      return [
        topicId,
        {
          topicId,
          title: topicId === 's0-9' ? 'Rasyonel Sayılar' : 'Oran – Orantı',
          questions,
          packs: [
            {
              id: 'temel-1',
              title: 'Temel alıştırma · 10 soru',
              note: '15–25 dakika ayır. İşlemleri kâğıtta yap; sonra cevabını seç.',
              ids: questions.map((q) => q.id),
            },
          ],
        },
      ];
    }),
  ),
};
export const hasPractice = (topicId: string) =>
  Object.hasOwn(questionBanks, topicId);

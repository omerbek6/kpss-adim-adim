'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ChevronRight, Check, BookOpen } from 'lucide-react';
import {
  programSlots,
  workRotation,
  studiedDayCount,
  nextTopic,
  formatMinutes,
  workEnd,
  type StudyState,
} from '@/lib/study';

export function ProgramPanel({
  state,
  date,
  disabled,
  onApply,
  onExam,
  onToday,
}: {
  state: StudyState;
  date: string;
  disabled: boolean;
  onApply: (minutes: number) => void;
  onExam: () => void;
  onToday: () => void;
}) {
  const [preview, setPreview] = useState(date > workEnd ? 240 : 50);
  const slots = programSlots(state, date, preview);
  const current = studiedDayCount(state, date) % 6;
  return (
    <div className="program-panel">
      <div className="catalog-intro">
        <p className="eyebrow">DERSLER BİRLİKTE İLERLER</p>
        <h2>Bir ders bitsin diye diğerini bekletme.</h2>
        <p>
          Konu listesindeki sıralama önem sırası değil. Matematik ve Türkçe
          düzenli; tarih, coğrafya ve vatandaşlık dönüşümlü. Geometri de uzun
          günlerde küçük bir pay alır.
        </p>
      </div>
      <section className="program-builder">
        <div className="program-section-head">
          <div>
            <h3>Gününe uygun program</h3>
            <p>
              Burada örneği gör; düğmeyle bugünkü tiklenebilir adımlarına
              uygula.
            </p>
          </div>
          <button className="plain-btn" onClick={onToday}>
            Bugünkü adımları aç <ChevronRight size={16} />
          </button>
        </div>
        <Tabs
          value={String(preview)}
          onValueChange={(v) => setPreview(Number(v))}
        >
          <TabsList className="program-options">
            {[
              { n: 50, s: 'İş günü' },
              { n: 100, s: 'İzin günüm' },
              { n: 240, s: 'İşten sonra · 4 saat' },
              { n: 360, s: 'İşten sonra · 6 saat' },
            ].map((x) => (
              <TabsTrigger key={x.n} value={String(x.n)}>
                {x.s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ol className="program-slots">
          {slots.map((slot, i) => (
            <li key={slot.subject + i}>
              <span className="slot-number">{i + 1}</span>
              <div>
                <strong>{slot.subject}</strong>
                <p>
                  {slot.subject === 'Tekrar'
                    ? 'Eski soruları çözümü kapatarak dene; zamanı gelen kısa tekrarları yap.'
                    : slot.subject === 'Paragraf'
                      ? 'Pegem’den 5 paragraf sorusu. Süre dolunca bırakabilirsin.'
                      : nextTopic(state, slot.subject).name +
                        ' · kaldığın yerden'}
                </p>
              </div>
              <span className="slot-minutes">En fazla {slot.minutes} dk</span>
            </li>
          ))}
        </ol>
        <div className="program-apply">
          <p>
            <strong>{formatMinutes(preview)} çalışma bütçesi.</strong> Molalar
            hariç. Adımlar tam parçalar hâlinde seçilir; bugünkü toplam daha
            kısa olabilir.
          </p>
          <button
            className="primary-btn"
            disabled={disabled}
            onClick={() => onApply(preview)}
          >
            Bu programı bugün uygula <ChevronRight size={17} />
          </button>
        </div>
        <p className="program-preserve">
          <Check size={16} /> Önceden koyduğun tikler korunur. Bu seçim yalnızca
          bugünü değiştirir.
        </p>
        <p className="program-footnote">
          Tekrarlar, süre ayrılan uzun günlerde sırayla gelir. Sıradaki konunun
          son kontrolünü geçmeden site aynı dersten yeni konu yüklemez.
        </p>
      </section>
      <section className="program-section">
        <h3>27 Eylül’e kadar: 6 çalışma günlük sıra</h3>
        <p>
          İş akşamında iki derse en fazla 25’er dakika. Bir gün kaçırırsan
          takvim borcu oluşmaz; çalıştığın bir sonraki gün sıradaki eşleşme
          gelir. İzin gününü yukarıdan 100 dakika seç.
        </p>
        <ol className="rotation-list">
          {workRotation.map((pair, i) => (
            <li
              key={i}
              className={
                date <= workEnd && i === current ? 'current-rotation' : ''
              }
            >
              <span>{i + 1}. çalışma günü</span>
              <strong>{pair.join(' + ')}</strong>
              {date <= workEnd && i === current && <small>Şimdiki sıra</small>}
            </li>
          ))}
        </ol>
        <p className="program-footnote">
          Çok yorgun olduğunda 25 dakikalık tek ders yeterli. 100 dakikalık
          günlerde matematik + Türkçe + dönüşümlü üçüncü ders + kısa tekrar var;
          sıranın altıncı gününde üçüncü ders geometri olur.
        </p>
      </section>
      <section className="program-section">
        <h3>28 Eylül’den sınava kadar</h3>
        <div className="phase-list">
          <div>
            <span>28–30 Eylül</span>
            <p>
              <strong>4 saatle başla.</strong> Sabah matematik, ardından Türkçe;
              öğleden sonra bir genel kültür dersi ve kısa tekrar. Ağır gelirse
              kısa gün seç.
            </p>
          </div>
          <div>
            <span>1–22 Ekim</span>
            <p>
              <strong>Sürdürebiliyorsan 6 saate çık.</strong> Matematik ve
              Türkçenin yanına iki dönüşümlü ders eklenir. Yaklaşık 08.30’da
              başla; yemek ve uzun molalarla öğleden sonraya yay. 22.00’ye kadar
              masada kalmak zorunda değilsin.
            </p>
          </div>
          <div>
            <span>23–24 Ekim</span>
            <p>
              <strong>En fazla 100 dakikalık hafif gün.</strong> Dengeli program
              bu günlerde yeni konu yerine eski yanlışlara ve kısa tekrara
              döner. 24 Ekim’de dinlenmeyi öne al.
            </p>
          </div>
        </div>
      </section>
      <section className="program-section method-section">
        <h3>Her dersin içinde nasıl çalışacaksın?</h3>
        <ol>
          <li>
            <strong>Önce küçük bir parçayı öğren.</strong> Bir örneğin neden
            öyle çözüldüğünü kendi sözlerinle anlat.
          </li>
          <li>
            <strong>Ardından kendin soru çöz.</strong> Çözüme bakmadan dene;
            yanlışta takıldığın kuralı bul. Anlatım bitmeden de işlediğin
            bölümün sorularını çözebilirsin.
          </li>
          <li>
            <strong>Araya zaman koy, yeniden hatırla.</strong> İlk çalışması
            biten konular için yaklaşık 1, 3 ve 7 gün sonra 10 dakikalık
            tekrarlar programa eklenir. Ara verirsen hepsi bir güne yığılmaz.
          </li>
          <li>
            <strong>Ders değişimini blok sonunda yap.</strong> Her birkaç
            dakikada bir başka derse atlama. Bir parçanın ardından 5–10 dakika,
            birkaç parçadan sonra daha uzun ara ver.
          </li>
        </ol>
        <p>
          Günlük ders payları ve 1–3–7 aralıkları sana uygun başlangıç
          önerilerimiz; herkes için kanıtlanmış tek bir ideal takvim değil.
          Aralıklı çalışma ve kendini sorularla yoklama, araştırmaların
          desteklediği genel ilkeler.
        </p>
        <a
          href="https://ies.ed.gov/ncee/wwc/PracticeGuide/1"
          target="_blank"
          rel="noreferrer"
        >
          Yöntemin dayanağı: IES öğrenme rehberi <ArrowUpRight size={15} />
        </a>
      </section>
      <section className="program-section exam-program">
        <BookOpen size={24} />
        <div>
          <h3>Deneme de programın bir parçası</h3>
          <p>
            İlk uygun izin gününde bir tam deneme çöz. Ekimde başlangıç için
            haftada 2 deneme + yanlış incelemesi ayır; örneğin çarşamba ve
            pazar. Normal programın üstüne ekleme, o günün bazı derslerinin
            yerine koy.
          </p>
          <p>
            Elinde tam deneme varsa bu düğme bugünü{' '}
            <strong>130 dakika deneme + 40 dakika inceleme</strong> olarak
            değiştirir. Bitirdiğin işler korunur; kalan normal dersler bugünden
            çıkarılır. Bu bir hatırlatma takvimi değil; deneme gününü sen
            seçersin.
          </p>
          <button className="primary-btn" disabled={disabled} onClick={onExam}>
            Bugün deneme çözmek istiyorum <ChevronRight size={16} />
          </button>
          <p className="program-footnote">
            Sonuçları ders ders karşılaştır. En çok hata yaptığın iki konuya
            sonraki günlerde daha fazla süre ayır. 80 puan veya bütün konuları
            bitirme garantisi yok.
          </p>
        </div>
      </section>
    </div>
  );
}

import { ArrowUpRight, Check, CircleAlert, Flag, Layers3 } from 'lucide-react';
import { topics, topicMeta, type PriorityTier, type Topic } from '@/lib/study';

const tiers: PriorityTier[] = ['essential', 'high', 'selective', 'skip'];
const copy: Record<PriorityTier, { title: string; detail: string }> = {
  essential: {
    title: 'Önce',
    detail: 'Temel netlerin omurgası. Zaman daralırsa bu grup korunur.',
  },
  high: {
    title: 'Yüksek getiri',
    detail: 'Temel oturunca ikinci sıra; denemelerde nete dönüşü yüksektir.',
  },
  selective: {
    title: 'Seçerek çalış',
    detail: 'Deneme ihtiyacı veya boş zaman varsa ekle; diğerlerini bekletme.',
  },
  skip: {
    title: 'Bu turda geç',
    detail: 'Şimdilik plana girmez. Deneme sonucu gerekirse geri açabilirsin.',
  },
};

export function PriorityPanel({
  selected,
  skipped,
  skipOverrides,
  onFilter,
}: {
  selected: string;
  skipped: Record<string, string> | undefined;
  skipOverrides: string[] | undefined;
  onFilter: (filter: string) => void;
}) {
  const overrides = new Set(skipOverrides || []);
  const topicCount = (tier: PriorityTier) =>
    topics.filter(
      (t) =>
        !t.practice &&
        (tier === 'skip'
          ? (topicMeta(t).tier === 'skip' && !overrides.has(t.id)) ||
            !!skipped?.[t.id]
          : topicMeta(t).tier === tier && !skipped?.[t.id]),
    ).length;
  const icon = (tier: PriorityTier) => {
    if (tier === 'essential') return <Flag size={18} />;
    if (tier === 'high') return <Check size={18} />;
    if (tier === 'selective') return <Layers3 size={18} />;
    return <CircleAlert size={18} />;
  };
  return (
    <section className="priority-panel" aria-labelledby="priority-title">
      <div className="priority-panel-head">
        <div>
          <p className="eyebrow">ZAMAN DARALINCA KARAR VERMEK İÇİN</p>
          <h2 id="priority-title">Önce kolay ve temel netler</h2>
          <p>
            Bu sıralama soru garantisi değil. ÖSYM’nin 2026 kapsamındaki test
            ağırlıkları ve temel becerilerin nete dönüşme ihtimaliyle
            hazırlanmış bir çalışma filtresi. Deneme sonucu her zaman önceliği
            değiştirebilir.
          </p>
        </div>
        <a
          href="https://dokuman.osym.gov.tr/web/2026/8/basvuru-kilavuzu-ci4pae-27090228.pdf"
          target="_blank"
          rel="noreferrer"
          className="priority-source"
        >
          ÖSYM kapsamı <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="priority-weights">
        <span>
          <strong>Genel Yetenek:</strong> sözel %50 · sayısal %50
        </span>
        <span>
          <strong>Genel Kültür:</strong> tarih %45 · coğrafya %30 · vatandaşlık
          %15 · güncel %10
        </span>
      </div>
      <div className="priority-grid">
        {tiers.map((tier) => {
          const active =
            selected === tier || (tier === 'skip' && selected === 'skipped');
          return (
            <button
              key={tier}
              className={`priority-card priority-${tier} ${active ? 'is-selected' : ''}`}
              onClick={() => onFilter(tier === 'skip' ? 'skipped' : tier)}
              aria-pressed={active}
            >
              <span className="priority-icon">{icon(tier)}</span>
              <span>
                <strong>{copy[tier].title}</strong>
                <small>{topicCount(tier)} konu</small>
              </span>
              <p>{copy[tier].detail}</p>
            </button>
          );
        })}
      </div>
      <p className="priority-note">
        <strong>Planın davranışı:</strong> “Önce” ve “Yüksek getiri” konuları
        otomatik sıraya girer. “Seçerek çalış” ancak temel sıra ilerledikçe
        gelir; “Bu turda geç” konuları plana alınmaz.
      </p>
    </section>
  );
}

export function topicMatchesPriority(
  topic: Topic,
  filter: string,
  skipped: Record<string, string> | undefined,
  skipOverrides: string[] | undefined,
) {
  if (filter === 'all') return true;
  const isSkipped =
    !!skipped?.[topic.id] ||
    (topicMeta(topic).tier === 'skip' &&
      !new Set(skipOverrides || []).has(topic.id));
  if (filter === 'skipped') return isSkipped;
  if (isSkipped) return false;
  return topicMeta(topic).tier === filter;
}

'use client';
import { useEffect, useState } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  Download,
  ShieldCheck,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import type { StudyState } from '@/lib/study';
export function usePwa() {
  const [online, setOnline] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine);
    connection();
    const display = window.matchMedia('(display-mode: standalone)');
    const install = () =>
      setInstalled(
        display.matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    install();
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    display.addEventListener('change', install);
    let alive = true;
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          if (!alive) return;
          if (reg.waiting) setWaiting(reg.waiting);
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            worker?.addEventListener('statechange', () => {
              if (
                alive &&
                worker.state === 'installed' &&
                navigator.serviceWorker.controller
              )
                setWaiting(worker);
            });
          });
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      display.removeEventListener('change', install);
    };
  }, []);
  const update = () => {
    if (!waiting) return;
    const reload = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', reload, {
      once: true,
    });
    waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
  };
  return { online, installed, waiting, update };
}
export function PwaPanel({
  installed,
  online,
  waiting,
  onUpdate,
  state,
  ready,
}: {
  installed: boolean;
  online: boolean;
  waiting: boolean;
  onUpdate: () => void;
  state: StudyState;
  ready: boolean;
}) {
  const backup = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              app: 'Adım Adım KPSS',
              state,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adim-adim-kpss-yedek.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="app-panel">
      <div className="section-heading">
        <p className="eyebrow">İPHONE’UNDA KENDİ ÇALIŞMA ALANIN</p>
        <h2>Adım Adım, cebinde.</h2>
        <p>
          Aynı hesabınla açtığında bilgisayardaki ve telefondaki kayıtların aynı
          yerde saklanır.
        </p>
      </div>
      <section className="install-card">
        <div className="install-app-icon">
          <img
            src="/icons/apple-touch-icon.png"
            alt="Adım Adım uygulama simgesi"
            width={76}
            height={76}
          />
          <div>
            <h3>Adım Adım</h3>
            <p>KPSS çalışma arkadaşın</p>
            <span>
              {installed
                ? 'Ana ekran uygulamasındasın'
                : 'Safari’den ana ekranına ekle'}
            </span>
          </div>
        </div>
        {!installed && (
          <ol className="install-steps">
            <li>
              <Smartphone />
              <div>
                <strong>Bu kalıcı bağlantıyı iPhone’da Safari ile aç.</strong>
                <a href="https://kpss-adim-adim-eylul-2026.omerbek6.chatgpt.site/">
                  Çalışma uygulamanı aç
                </a>
                <p>
                  Bilgisayardaki “localhost” adresi telefonda açılmaz. Gerekirse
                  bu sitenin sahibi olduğun hesapla giriş yap.
                </p>
              </div>
            </li>
            <li>
              <Share />
              <div>
                <strong>Safari’de Paylaş’a dokun.</strong>
                <p>Görünmüyorsa önce “Daha Fazla” menüsünü aç.</p>
              </div>
            </li>
            <li>
              <PlusSquare />
              <div>
                <strong>“Ana Ekrana Ekle”yi seç.</strong>
                <p>
                  Seçenek görünmüyorsa Paylaş listesindeki “Eylemleri Düzenle”ye
                  bak.
                </p>
              </div>
            </li>
            <li>
              <Download />
              <div>
                <strong>
                  “Web Uygulaması Olarak Aç” açıkken Ekle’ye dokun.
                </strong>
                <p>
                  Sonrasında telefonunun ana ekranındaki Adım Adım simgesinden
                  aç.
                </p>
              </div>
            </li>
          </ol>
        )}
        <a
          className="small-source"
          href="https://support.apple.com/en-gb/guide/iphone/iphea86e5236/ios"
          target="_blank"
          rel="noreferrer"
        >
          Apple’ın iPhone kurulum yönergesi
        </a>
      </section>
      <div className="app-info-grid">
        <section className="surface-card">
          <ShieldCheck />
          <h3>Sana özel kayıtlar</h3>
          <p>
            Tikler, notlar, sayaç kayıtları ve denemeler özel sitende saklanır.
            Paylaşıma açmadım. Telefon tarayıcısının verilerini silmek
            sunucudaki kayıtlarını silmez.
          </p>
          <button className="plain-btn" disabled={!ready} onClick={backup}>
            <Download size={17} /> Kayıtlarımın bir kopyasını indir
          </button>
          <p className="field-hint">
            İndirdiğin dosya kişisel notlarını içerir; güvenli bir yerde sakla.
          </p>
        </section>
        <section className="surface-card">
          <WifiOff />
          <h3>{online ? 'Bağlantın var' : 'Şu an çevrimdışısın'}</h3>
          <p>
            Kayıt okumak ve değiştirmek için internet gerekir. Bağlantı
            kesilirse kaydedilmeyen bir iş için “kaydedildi” gösterilmez.
            Çevrimdışı açılışta yalnızca bağlantı ekranı görünür; özel
            kayıtların cihaz önbelleğine alınmaz.
          </p>
        </section>
        <section className="surface-card">
          <Smartphone />
          <h3>Sayaç ve bildirimler</h3>
          <p>
            Sayaç açılışta geçen zamanı yeniden hesaplar. Telefon kilitliyken
            alarm veya bildirim garantisi yok; önemli bir çalışma için iPhone’un
            Saat uygulamasından da sayaç kurabilirsin. Çalışmayı bıraktığında
            sayacı duraklat.
          </p>
          <p className="field-hint">
            Sayaç süresi otomatik olarak konu tamamlandı anlamına gelmez. Süreyi
            kaydettikten sonra ilgili adımı ayrıca işaretle.
          </p>
        </section>
        <section className="surface-card">
          <RefreshCw />
          <h3>Güncel uygulama</h3>
          <p>
            {waiting
              ? 'Yeni sürüm hazır. Açık formunu kaydettikten sonra güncelleyebilirsin.'
              : 'Güncellemeler kalıcı site adresine gelir. Yeni bir uygulama yüklemen gerekmez.'}
          </p>
          {waiting && (
            <button className="primary-btn" onClick={onUpdate}>
              Yeni sürümü aç
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

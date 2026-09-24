import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { X, ArrowRight, Sparkles, Percent, Calendar, Maximize2, Tag } from 'lucide-react';

/**
 * 📸 РЕКЛАМНЫЙ БАННЕР АКЦИИ (VICRENOVATION)
 * Адаптивный дизайн:
 * - На смартфонах: компактная горизонтальная плашка-карточка внизу экрана (не перекрывает сайт).
 * - На планшетах и компьютерах: стильный вертикальный постер 3:4.
 * - Полноэкранный Lightbox для просмотра фото в высоком разрешении.
 */
export const DEFAULT_PROMO_BANNER_IMAGE = '/actie.jpeg';
export const FALLBACK_PROMO_BANNER_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

interface PromoFloatingBannerProps {
  onOpenQuote: () => void;
  imageUrl?: string;
}

export const PromoFloatingBanner: React.FC<PromoFloatingBannerProps> = ({
  onOpenQuote,
  imageUrl = DEFAULT_PROMO_BANNER_IMAGE,
}) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentImgSrc, setCurrentImgSrc] = useState(imageUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Плавное появление через 1.2 секунды
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleClickBanner = () => {
    onOpenQuote();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  const handleRestore = () => {
    setIsDismissed(false);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleImageError = () => {
    if (currentImgSrc === '/actie.jpeg') {
      setCurrentImgSrc('/Actie.jpeg');
    } else if (currentImgSrc === '/Actie.jpeg') {
      setCurrentImgSrc(FALLBACK_PROMO_BANNER_IMAGE);
    }
  };

  // Компактный стильный виджет при закрытии баннера
  if (isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
        <button
          onClick={handleRestore}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white pl-3.5 pr-4 py-2.5 shadow-[0_10px_25px_rgba(5,150,105,0.35)] hover:shadow-[0_15px_35px_rgba(5,150,105,0.5)] transition-all duration-300 hover:scale-105 cursor-pointer border border-emerald-500/50 hover:border-emerald-400"
          title={t('promoTitle')}
          aria-label={t('promoTitle')}
        >
          {/* Пульсирующий индикатор */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-tr from-amber-500 to-yellow-300"></span>
          </span>

          {/* Плашка со скидкой */}
          <span className="flex items-center gap-1 rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[11px] font-black text-amber-300 border border-amber-400/40">
            <Percent className="h-3 w-3 stroke-[3]" />
            5%
          </span>

          <span className="text-xs font-bold tracking-wide text-slate-100 group-hover:text-emerald-300 transition-colors">
            {t('promoBadge')}
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      <aside
        aria-label="Oktober Promo Banner"
        className={`fixed z-40 transition-all duration-700 ease-out transform ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
        } bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[325px]`}
      >
        {/* =========================================================================
            📱 МОБИЛЬНАЯ ВЕРСИЯ (sm:hidden)
            Изящная горизонтальная карточка-уведомление внизу экрана:
            - Не закрывает 80% экрана телефона
            - Фотография видна аккуратной крупной миниатюрой (с возможностью открыть на весь экран)
            - Кнопка закрытия не нажимается случайно
            - Удобно для большого пальца
           ========================================================================= */}
        <div
          onClick={handleClickBanner}
          className="sm:hidden relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-950/95 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] p-2.5 flex items-center gap-3 ring-1 ring-white/10"
          role="button"
          tabIndex={0}
        >
          {/* Миниатюра фотографии акции с кнопкой увеличения */}
          <div
            onClick={handleOpenModal}
            className="relative w-24 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30 shadow-md group/thumb cursor-zoom-in"
            title="Foto vergroten"
          >
            <img
              src={currentImgSrc}
              alt="VicRenovation 5% Korting"
              onError={handleImageError}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover/thumb:scale-108"
            />
            {/* Стикер скидки на фото */}
            <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-slate-950 shadow-sm border border-amber-300">
              <Percent className="h-2.5 w-2.5 stroke-[3]" />
              5%
            </div>
            {/* Иконка лупы/увеличения */}
            <div className="absolute bottom-1 right-1 p-1 rounded-md bg-slate-950/70 text-white/90 backdrop-blur-xs">
              <Maximize2 className="h-2.5 w-2.5" />
            </div>
          </div>

          {/* Текстовая колонка и кнопка действия */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div className="flex items-start justify-between gap-1">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  {t('promoBadge')}
                </span>
                <h4 className="text-xs font-extrabold text-white leading-snug line-clamp-1">
                  {t('promoTitle')}
                </h4>
              </div>

              {/* Кнопка закрытия для мобильного */}
              <button
                onClick={handleClose}
                type="button"
                aria-label="Sluiten"
                className="p-1 -mr-0.5 -mt-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[10px] text-emerald-300/90 font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 shrink-0 text-emerald-400" />
              <span>{t('promoValidity')}</span>
            </p>

            {/* Компактная кнопка перехода к оферте */}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm">
              <span className="truncate">{t('promoCta')}</span>
              <ArrowRight className="h-3 w-3 shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            💻 ДЕСКТОП ВЕРСИЯ (hidden sm:flex)
            Полноразмерная карточка с большим постером 3:4
           ========================================================================= */}
        <div
          onClick={handleClickBanner}
          className="hidden sm:flex group relative cursor-pointer overflow-hidden rounded-[26px] border border-emerald-500/40 bg-slate-950 shadow-[0_20px_50px_rgba(5,150,105,0.25)] hover:shadow-[0_25px_60px_rgba(5,150,105,0.38)] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/70 flex-col ring-1 ring-white/10"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClickBanner();
            }
          }}
        >
          {/* Декоративное свечение по краям */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* 
            ФОТОГРАФИЯ (ТОЧНОЕ СООТНОШЕНИЕ 3:4)
            Фотография 1200x1600 заполняет блок идеально без растяжений и обрезки
          */}
          <div className="relative w-full aspect-[3/4] bg-slate-900 overflow-hidden flex items-center justify-center">
            <img
              src={currentImgSrc}
              alt="VicRenovation 5% Korting Actie"
              onError={handleImageError}
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />

            {/* Градиенты только по краям для идеальной четкости постера */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/75 via-slate-950/20 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Верхняя строка управления: Бейдж + Кнопки */}
            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-20">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-3 py-1 text-[11px] font-black text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300">
                <Sparkles className="h-3 w-3 text-slate-950 animate-pulse" />
                <span>-5% KORTING</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleOpenModal}
                  type="button"
                  title="Foto vergroten / Увеличить"
                  aria-label="Foto vergroten"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white/90 backdrop-blur-md transition-all hover:bg-slate-900 hover:text-white hover:scale-110 focus:outline-hidden ring-1 ring-white/20 shadow-md cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleClose}
                  type="button"
                  title="Sluiten"
                  aria-label="Sluit banner"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white/90 backdrop-blur-md transition-all hover:bg-red-600 hover:text-white hover:scale-110 focus:outline-hidden ring-1 ring-white/20 shadow-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Срок действия внизу фотографии */}
            <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-500/30 shadow-md">
                <Calendar className="h-3 w-3 text-emerald-400" />
                <span>{t('promoValidity')}</span>
              </div>
            </div>
          </div>

          {/* Нижняя текстовая плашка для десктопа */}
          <div className="p-3.5 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-emerald-500/20 text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                VicRenovation Deal
              </span>
              <span className="text-[10px] font-semibold text-amber-300/90 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Oktober 2026
              </span>
            </div>

            <h4 className="mt-1 text-sm font-extrabold text-white leading-snug group-hover:text-emerald-300 transition-colors">
              {t('promoTitle')}
            </h4>

            <p className="mt-0.5 text-[11px] text-slate-300 leading-normal line-clamp-2">
              {t('promoSubtitle')}
            </p>

            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-950/40 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-200 border border-emerald-400/30">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-300" />
                <span>{t('promoCta')}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </aside>

      {/* Полноэкранный Lightbox для кристально чистого просмотра постера на любом устройстве */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/40 flex flex-col ring-1 ring-white/10"
          >
            <button
              onClick={handleCloseModal}
              aria-label="Sluit foto"
              className="absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer ring-1 ring-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-2 flex items-center justify-center bg-black/80">
              <img
                src={currentImgSrc}
                alt="VicRenovation Actie Volledig"
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-inner"
              />
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between gap-3 border-t border-slate-800">
              <div>
                <p className="text-white font-extrabold text-sm">{t('promoTitle')}</p>
                <p className="text-emerald-400 text-xs font-semibold">{t('promoDiscountBadge')} • {t('promoValidity')}</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleClickBanner();
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 shrink-0 cursor-pointer border border-emerald-400/30"
              >
                {t('promoCta')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

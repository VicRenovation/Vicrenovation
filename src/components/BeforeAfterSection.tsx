import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { TransformationItem } from '../types';
import { SlidersHorizontal, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { INITIAL_TRANSFORMATIONS } from '../data/initialTransformations';
import { fetchTransformationsFromFirestore } from '../lib/firestoreService';

export const BeforeAfterSection: React.FC = () => {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(50);
  const [transformations, setTransformations] = useState<TransformationItem[]>(() => {
    try {
      const cached = localStorage.getItem('vr_transformations_cache');
      return cached ? JSON.parse(cached) : INITIAL_TRANSFORMATIONS;
    } catch (e) {
      return INITIAL_TRANSFORMATIONS;
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [transformations]);

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        const data = await fetchTransformationsFromFirestore();
        if (Array.isArray(data) && data.length > 0) {
          setTransformations(data);
          try {
            localStorage.setItem('vr_transformations_cache', JSON.stringify(data));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Error fetching transformations, using cache:', err);
      }
    };

    fetchTransformations();
    const interval = setInterval(fetchTransformations, 4000);
    return () => clearInterval(interval);
  }, []);

  if (transformations.length === 0) {
    return null;
  }

  const currentItem: TransformationItem = transformations[selectedIndex] || transformations[0];
  if (!currentItem) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min((x / rect.width) * 100, 95));
    setSliderPos(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min((x / rect.width) * 100, 95));
    setSliderPos(percent);
  };

  return (
    <section className="bg-slate-900 text-white py-16 lg:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-4 w-4" />
            Bewezen Resultaat
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">
            {t('beforeAfterTitle')}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t('beforeAfterSubtitle')}
          </p>
        </div>

        {/* Project Selector Pills if multiple projects */}
        {transformations.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            {transformations.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setSliderPos(50);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedIndex === idx
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[200px] sm:max-w-none">{item.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active Project Info */}
        <div className="mt-8 text-center space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <span>{currentItem.title}</span>
          </h3>
          {currentItem.location && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{currentItem.location}</span>
            </p>
          )}
          {currentItem.description && (
            <p className="text-xs text-slate-300 max-w-xl mx-auto pt-1">
              {currentItem.description}
            </p>
          )}
        </div>

        {/* Interactive Comparison Canvas */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div
            id="before-after-slider"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl cursor-ew-resize select-none group"
          >
            {/* After Image (Background & Object-Contain Foreground) */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-950">
              <img
                src={currentItem.afterImageUrl}
                alt={`${currentItem.title} - After`}
                className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-20 scale-110 pointer-events-none"
              />
              <img
                src={currentItem.afterImageUrl}
                alt={`${currentItem.title} - After`}
                className="relative h-full w-full object-contain z-0"
              />
            </div>

            {/* After Badge */}
            <div className="absolute top-4 right-4 z-20 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-slate-950 uppercase shadow-xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t('afterLabel')} — {currentItem.afterLabel || 'Na Renovatie'}</span>
            </div>

            {/* Before Badge */}
            <div className="absolute top-4 left-4 z-20 rounded-xl bg-slate-950/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 uppercase border border-slate-700 shadow-xl whitespace-nowrap pointer-events-none">
              <span>{t('beforeLabel')} — {currentItem.beforeLabel || 'Vooraf'}</span>
            </div>

            {/* Before Image (Clipped container) */}
            <div
              className="absolute top-0 left-0 bottom-0 overflow-hidden z-10"
              style={{ width: `${sliderPos}%` }}
            >
              <div
                className="h-full relative flex items-center justify-center overflow-hidden bg-slate-950"
                style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
              >
                <img
                  src={currentItem.beforeImageUrl}
                  alt={`${currentItem.title} - Before`}
                  className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-20 scale-110 pointer-events-none"
                />
                <img
                  src={currentItem.beforeImageUrl}
                  alt={`${currentItem.title} - Before`}
                  className="relative h-full w-full object-contain z-0"
                />
              </div>
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-30 shadow-[0_0_20px_rgba(16,185,129,0.9)]"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl border-2 border-white group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>👈</span>
            <span>Beweeg de muis of vinger om het verschil te zien</span>
            <span>👉</span>
          </div>
        </div>

        {/* Gallery Cards of all Transformations below slider */}
        {transformations.length > 0 && (
          <div className="mt-14 max-w-5xl mx-auto space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Alle Transformatie Projecten ({transformations.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {transformations.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setSliderPos(50);
                    window.scrollTo({
                      top: document.querySelector('#before-after-slider')?.getBoundingClientRect().top
                        ? window.scrollY + (document.querySelector('#before-after-slider')?.getBoundingClientRect().top || 0) - 100
                        : window.scrollY,
                      behavior: 'smooth',
                    });
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedIndex === idx
                      ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Side by side mini thumbnails */}
                    <div className="grid grid-cols-2 gap-1.5 h-24 rounded-xl overflow-hidden relative">
                      <div className="relative h-full w-full">
                        <img src={item.beforeImageUrl} alt="Before" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 left-1 text-[8px] bg-rose-950/90 text-rose-300 px-1 py-0.5 rounded font-bold uppercase">Voor</span>
                      </div>
                      <div className="relative h-full w-full">
                        <img src={item.afterImageUrl} alt="After" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[8px] bg-emerald-950/90 text-emerald-300 px-1 py-0.5 rounded font-bold uppercase">Na</span>
                      </div>
                    </div>

                    <div className="font-bold text-xs text-white truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.description || item.location}</div>
                  </div>

                  <div className="pt-2 text-[10px] font-bold text-emerald-400 flex items-center justify-between">
                    <span>Bekijk in Slider</span>
                    <span>➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};


import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { GalleryItem, ServiceCategory } from '../types';
import { INITIAL_GALLERY } from '../data/initialGallery';
import { Image as ImageIcon, X, ZoomIn, Sparkles, Filter, Play, Film, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  label: string;
}

import { fetchGalleryFromFirestore } from '../lib/firestoreService';

export const Gallery: React.FC = () => {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>(() => {
    try {
      const cached = localStorage.getItem('vr_gallery_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_GALLERY;
    } catch (e) {
      return INITIAL_GALLERY;
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  // Fetch gallery items from Firestore on mount and periodically
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await fetchGalleryFromFirestore();
        if (Array.isArray(data)) {
          setItems(data);
          try {
            localStorage.setItem('vr_gallery_cache', JSON.stringify(data));
          } catch (e) {
            console.warn('LocalStorage save failed:', e);
          }
        }
      } catch (err) {
        console.warn('Using local gallery cache fallback:', err);
      }
    };

    fetchGallery();
    const interval = setInterval(fetchGallery, 3000);
    return () => clearInterval(interval);
  }, []);

  const getMediaList = (item: GalleryItem): MediaItem[] => {
    const list: MediaItem[] = [
      { type: 'image', url: item.imageUrl, label: 'Hoofdfoto' },
    ];
    if (item.additionalImages && item.additionalImages.length > 0) {
      item.additionalImages.forEach((img, idx) => {
        list.push({ type: 'image', url: img, label: `Foto #${idx + 1}` });
      });
    }
    if (item.videoUrl && item.videoUrl.trim() !== '') {
      list.push({ type: 'video', url: item.videoUrl, label: 'Video van de werf' });
    }
    return list;
  };

  const openLightbox = (item: GalleryItem) => {
    setActiveLightbox(item);
    setActiveMediaIndex(0);
  };

  useEffect(() => {
    if (!activeLightbox) return;
    const mediaList = getMediaList(activeLightbox);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightbox(null);
      } else if (e.key === 'ArrowRight') {
        setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightbox]);

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const getCategoryBadge = (cat: ServiceCategory) => {
    switch (cat) {
      case 'windows':
        return { label: 'Ramen & Deuren', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'interior':
        return { label: 'Interieurrenovatie', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'hsb':
        return { label: 'HSB-panelen', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
  };

  return (
    <section id="gallery" className="bg-slate-950 text-white py-16 lg:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ImageIcon className="h-4 w-4" />
            {t('navGallery')}
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">
            {t('galleryTitle')}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t('gallerySubtitle')}
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t('filterAll')} ({items.length})
          </button>

          <button
            onClick={() => setSelectedCategory('windows')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'windows'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t('filterWindows')}
          </button>

          <button
            onClick={() => setSelectedCategory('interior')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'interior'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t('filterInterior')}
          </button>

          <button
            onClick={() => setSelectedCategory('hsb')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === 'hsb'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t('filterHSB')}
          </button>
        </div>

        {/* Photo Grid */}
        {filteredItems.length === 0 ? (
          <div className="mt-12 py-16 text-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-slate-400">
            <ImageIcon className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold">
              {items.length === 0
                ? 'Geen projecten gevonden in de galerij.'
                : 'Geen projecten gevonden in deze categorie.'}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
            const badge = getCategoryBadge(item.category);
            const extraCount = (item.additionalImages?.length || 0) + (item.videoUrl ? 1 : 0);

            return (
              <div
                key={item.id}
                onClick={() => openLightbox(item)}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer shadow-xl hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="h-64 sm:h-72 w-full overflow-hidden relative bg-slate-950 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                  />
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="relative max-h-full max-w-full object-contain z-10 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity z-10 pointer-events-none"></div>

                  {/* Badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md border backdrop-blur-md ${badge.color}`}>
                    {badge.label}
                  </span>

                {/* Extra Photos / Video Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  {extraCount > 0 && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-700 text-emerald-400 flex items-center gap-1 shadow-md">
                      <Layers className="h-3 w-3" />
                      <span>1 + {extraCount} Media</span>
                    </span>
                  )}
                  {item.videoUrl && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
                      <Play className="h-3 w-3 fill-slate-950" />
                      <span>Video</span>
                    </span>
                  )}
                </div>

                  {/* Zoom Icon Hover */}
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                </div>

                {/* Content Overlay/Card Info */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

      </div>

      {/* Lightbox Modal with Process Photos & Video Viewer */}
      {activeLightbox && (() => {
        const mediaList = getMediaList(activeLightbox);
        const safeIndex = Math.min(Math.max(0, activeMediaIndex), mediaList.length - 1);
        const currentMedia = mediaList[safeIndex] || mediaList[0];

        const goNext = () => setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
        const goPrev = () => setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in overflow-y-auto">
            <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 my-auto">
              {/* Close Button */}
              <button
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full bg-slate-950/85 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-lg border border-slate-700/50"
                title="Sluiten (Esc)"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Lightbox Main Stage (Photo or Video) */}
              <div className="max-h-[55vh] sm:max-h-[65vh] h-[350px] sm:h-[480px] overflow-hidden bg-black flex items-center justify-center relative group">
                {/* Left / Right Nav Arrows */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl border border-slate-700"
                      title="Vorige foto (Pijl links)"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl border border-slate-700"
                      title="Volgende foto (Pijl rechts)"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Active Media Render */}
                {currentMedia.type === 'video' ? (
                  currentMedia.url.includes('youtube') || currentMedia.url.includes('vimeo') || currentMedia.url.includes('youtu.be') ? (
                    <iframe
                      src={
                        currentMedia.url.includes('youtube.com/watch?v=')
                          ? currentMedia.url.replace('watch?v=', 'embed/')
                          : currentMedia.url.includes('youtu.be/')
                          ? `https://www.youtube.com/embed/${currentMedia.url.split('youtu.be/')[1]?.split('?')[0]}`
                          : currentMedia.url
                      }
                      title={activeLightbox.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                    />
                  )
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={activeLightbox.title}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              {/* Thumbnails Strip (Step-by-Step photos and process videos) */}
              {mediaList.length > 1 && (
                <div className="p-4 bg-slate-950 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Project Album & Proces ({mediaList.length} Media)</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {mediaList.map((m, idx) => {
                      const isActive = idx === safeIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`relative h-16 w-22 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                            isActive
                              ? 'border-emerald-500 ring-2 ring-emerald-500/40 opacity-100 scale-105 shadow-md'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {m.type === 'video' ? (
                            <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center gap-1">
                              <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                                <Play className="h-3 w-3 fill-slate-950 ml-0.5" />
                              </div>
                            </div>
                          ) : (
                            <img src={m.url} alt={m.label} className="h-full w-full object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lightbox Details */}
              <div className="p-6 space-y-3 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getCategoryBadge(activeLightbox.category).color}`}>
                    {getCategoryBadge(activeLightbox.category).label}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white">{activeLightbox.title}</h3>
                {activeLightbox.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeLightbox.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};

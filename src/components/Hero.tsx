import React from 'react';
import { useLanguage } from './LanguageContext';
import { ArrowRight, ShieldCheck, CheckCircle2, Award, Zap, Layers, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote }) => {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="VicRenovation modern architectural house"
          className="h-full w-full object-cover object-center opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            {t('heroBadge')}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            {t('heroTitle').split('&')[0]} &{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {t('heroTitle').split('&')[1] || ''}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
            {t('heroSubtitle')}
          </p>

          {/* Core Highlights Pills */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Duitse WDS Profielen</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Interieurrenovaties A-Z</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Duurzame HSB-panelen</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollToSection('configurator')}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all"
            >
              <Layers className="h-5 w-5" />
              {t('btnConfiguratorCTA')}
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={onOpenQuote}
              className="flex items-center gap-2 rounded-xl border-2 border-emerald-500/80 bg-slate-900/90 px-7 py-4 text-base font-extrabold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all backdrop-blur-sm shadow-lg shadow-emerald-500/10"
            >
              {t('btnQuote')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6 border-t border-slate-800/80 pt-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
            <div className="text-3xl font-black text-emerald-400">12+</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
              {t('heroStatYears')}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
            <div className="text-3xl font-black text-emerald-400">650+</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
              {t('heroStatProjects')}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
            <div className="text-3xl font-black text-emerald-400">10 Jaar</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
              {t('heroStatWarranty')}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
            <div className="text-3xl font-black text-emerald-400">A+++</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
              {t('heroStatEnergy')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

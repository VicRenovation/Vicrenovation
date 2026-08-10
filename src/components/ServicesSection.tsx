import React from 'react';
import { useLanguage } from './LanguageContext';
import { Home, Hammer, Layers, ArrowRight, CheckCircle2, Shield, Wrench, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  onOpenQuote: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenQuote }) => {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-24">
      {/* Interior Renovations Section */}
      <section id="interior" className="bg-slate-900 text-white py-16 lg:py-24 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Home className="h-4 w-4" />
              Vakmanschap Binnenshuis
            </div>
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">
              {t('interiorTitle')}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              {t('interiorSubtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Kitchens */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-emerald-500/50 transition-all hover:bg-slate-900 shadow-xl">
              <div className="h-44 rounded-xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80"
                  alt="Kitchen renovation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-xs font-bold bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md">
                  Op Maat
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{t('intKitchens')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('intKitchensDesc')}</p>
            </div>

            {/* Bathrooms */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-emerald-500/50 transition-all hover:bg-slate-900 shadow-xl">
              <div className="h-44 rounded-xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
                  alt="Bathroom renovation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-xs font-bold bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md">
                  Sanitair
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{t('intBathrooms')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('intBathroomsDesc')}</p>
            </div>

            {/* Full House */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-emerald-500/50 transition-all hover:bg-slate-900 shadow-xl">
              <div className="h-44 rounded-xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                  alt="Full house renovation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-xs font-bold bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md">
                  Totaalconcept
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{t('intFullHouse')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('intFullHouseDesc')}</p>
            </div>

            {/* Bespoke Carpentry */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-emerald-500/50 transition-all hover:bg-slate-900 shadow-xl">
              <div className="h-44 rounded-xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                  alt="Custom carpentry"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-xs font-bold bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md">
                  Timmerwerk
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{t('intCarpentry')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('intCarpentryDesc')}</p>
            </div>

          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onOpenQuote}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-sm font-black text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
            >
              <span>Vraag Interieur Offerte Aan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* HSB Panelen (Timber Frame) Section */}
      <section id="hsb" className="bg-slate-950 text-white py-16 lg:py-24 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Layers className="h-4 w-4" />
              Duurzaam & Prefab Bouwen
            </div>
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">
              {t('hsbTitle')}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              {t('hsbSubtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-lg">🌱</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Eco Norm</span>
              </div>
              <h3 className="text-base font-bold text-white">{t('hsbEcoTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('hsbEcoDesc')}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-lg">⚡</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Snelheid</span>
              </div>
              <h3 className="text-base font-bold text-white">{t('hsbSpeedTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('hsbSpeedDesc')}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-lg">❄️</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Isolatie</span>
              </div>
              <h3 className="text-base font-bold text-white">{t('hsbInsulationTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('hsbInsulationDesc')}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-xl bg-purple-500/20 text-purple-400 font-bold text-lg">📐</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Maatwerk</span>
              </div>
              <h3 className="text-base font-bold text-white">{t('hsbCustomTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t('hsbCustomDesc')}</p>
            </div>

          </div>

          {/* Wall Structure Diagram */}
          <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Opbouw van VicRenovation HSB Wandpanelen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">1. Binnenafwerking</div>
                <div className="text-[11px] text-slate-400 mt-1">Gipsplaat 12.5mm / OSB</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">2. Dampremmende Folie</div>
                <div className="text-[11px] text-slate-400 mt-1">Luchtdichte seal</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="font-bold text-emerald-400">3. Houten Regelwerk</div>
                <div className="text-[11px] text-slate-300 mt-1">140mm-200mm minerale wol</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">4. Dampopen Folie</div>
                <div className="text-[11px] text-slate-400 mt-1">Waterdichte ademende laag</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">5. Gevelafwerking</div>
                <div className="text-[11px] text-slate-400 mt-1">Hout, steenstrip of stucwerk</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

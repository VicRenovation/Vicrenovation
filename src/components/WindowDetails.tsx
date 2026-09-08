import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { WINDOW_PROFILES } from '../data/windowProfiles';
import { ShieldCheck, Zap, Volume2, Sun, Lock, Award, CheckCircle, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { fetchProfilesFromFirestore } from '../lib/firestoreService';

export const WindowDetails: React.FC = () => {
  const { language, t } = useLanguage();
  const [profileImages, setProfileImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await fetchProfilesFromFirestore();
        if (data && typeof data === 'object') {
          setProfileImages(data);
          try {
            localStorage.setItem('vr_profile_images', JSON.stringify(data));
          } catch (e) {}
        }
      } catch (e) {
        const cached = localStorage.getItem('vr_profile_images');
        if (cached) {
          try {
            setProfileImages(JSON.parse(cached));
          } catch (err) {}
        }
      }
    };

    fetchProfiles();
    const interval = setInterval(fetchProfiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: Zap,
      titleKey: 'featEnergyTitle',
      descKey: 'featEnergyDesc',
      badge: 'A+++ Energielabel',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: Lock,
      titleKey: 'featSecurityTitle',
      descKey: 'featSecurityDesc',
      badge: 'RC2/RC3 Veiligheid',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: Volume2,
      titleKey: 'featAcousticTitle',
      descKey: 'featAcousticDesc',
      badge: 'Tot -46 dB Stilte',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: Sun,
      titleKey: 'featUVTitle',
      descKey: 'featUVDesc',
      badge: '10 Jaar Kleurecht',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    },
  ];

  const scrollToConfigurator = () => {
    const el = document.getElementById('configurator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="windows" className="bg-white text-slate-900 py-16 lg:py-24 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Award className="h-4 w-4 text-emerald-700" />
            WDS Officiële Profielen Collectie
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight text-slate-950">
            {t('windowDetailsTitle')}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {t('windowDetailsSubtitle')}
          </p>
        </div>

        {/* WDS Series Detailed Showcase Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-widest">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>WDS 8S • WDS 7S • WDS 6S • WDS 5S</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Kies het Perfecte Profielsysteem
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
              Van ultra-energiezuinige passiefhuis ramen (WDS 8S) tot lichtovergoten stadsramen (WDS 6S) en compacte balkonoplossingen (WDS 5S).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {WINDOW_PROFILES.filter((p) => p.type === 'pvc').map((profile) => {
              const langKey = (language as 'nl' | 'en' | 'ru') || 'ru';
              const currentImg = profileImages[profile.id] || profile.defaultImage;

              return (
                <div
                  key={profile.id}
                  className="rounded-3xl border border-slate-200 bg-white hover:border-emerald-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden"
                >
                  {/* Glowing subtle hover backdrop */}
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all pointer-events-none"></div>

                  <div className="space-y-6 relative z-10">
                    {/* Large High-Res Image Container */}
                    <div className="relative h-64 sm:h-72 md:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group/img flex items-center justify-center p-4">
                      <img
                        src={currentImg}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-10 pointer-events-none scale-110"
                      />
                      <img
                        src={currentImg}
                        alt={profile.name}
                        className="relative max-h-full max-w-full object-contain z-10 group-hover/img:scale-105 transition-transform duration-500 ease-out filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none z-10"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
                        <div className="rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{profile.series}</span>
                        </div>
                        <div className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm">
                          {profile.depthMm} mm Inbouwdiepte
                        </div>
                      </div>

                      {/* Bottom Image Spec Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-xs z-20">
                        <span className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 font-extrabold flex items-center gap-1.5 shadow-xs">
                          <Layers className="h-3.5 w-3.5 text-emerald-600" />
                          {profile.chambers} Kamers
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-emerald-700 font-black flex items-center gap-1.5 shadow-xs">
                          <Zap className="h-3.5 w-3.5 text-emerald-600" />
                          {profile.uwValue}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-emerald-700 transition-colors flex items-center justify-between gap-2">
                        <span>{profile.name}</span>
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {profile.description[langKey] || profile.description.ru}
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200 text-xs">
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Kamers</span>
                        <span className="font-black text-slate-900 text-sm">{profile.chambers} Kamers</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Isolatie</span>
                        <span className="font-black text-emerald-700 text-sm">{profile.uwValue.split(' ')[0]}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Max Glas</span>
                        <span className="font-black text-slate-900 text-sm">Tot {profile.maxGlassThicknessMm} mm</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Geluidsdemping</span>
                        <span className="font-black text-emerald-700 text-sm">-{profile.soundInsulationDb} dB</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Belangrijkste kenmerken:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(profile.features[langKey] || profile.features.ru).slice(0, 4).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-xs leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-slate-200 mt-6 relative z-10">
                    <button
                      onClick={scrollToConfigurator}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 active:scale-98"
                    >
                      <Layers className="h-4.5 w-4.5" />
                      <span>{profile.name} Configureren in 3D</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {benefits.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 hover:border-emerald-300 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border bg-gradient-to-br ${item.color}`}>
                      <IconComp className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {t(item.titleKey)}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Standaard bij VicRenovation</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

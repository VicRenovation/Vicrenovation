import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { WINDOW_PROFILES, GLASS_OPTIONS } from '../data/windowProfiles';
import { WindowProfile, ColorFinish, GlassOption } from '../types';
import { Check, ShieldCheck, Zap, Sliders, Layers, ArrowRight, Info, Eye, Sparkles } from 'lucide-react';

interface WindowConfiguratorProps {
  onSelectForQuote: (config: {
    profile: WindowProfile;
    color: ColorFinish;
    glass: GlassOption;
  }) => void;
}

export const WindowConfigurator: React.FC<WindowConfiguratorProps> = ({ onSelectForQuote }) => {
  const { language, t } = useLanguage();

  const [selectedProfile, setSelectedProfile] = useState<WindowProfile>(WINDOW_PROFILES[0]);
  const [selectedColor, setSelectedColor] = useState<ColorFinish>(selectedProfile.availableColors[0]);
  const [selectedGlass, setSelectedGlass] = useState<GlassOption>(GLASS_OPTIONS[0]);
  const [sashOpen, setSashOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'specs'>('visualizer');

  const handleProfileChange = (profile: WindowProfile) => {
    setSelectedProfile(profile);
    // Keep color if available, or set to first
    const colorMatch = profile.availableColors.find((c) => c.id === selectedColor.id);
    setSelectedColor(colorMatch || profile.availableColors[0]);
  };

  return (
    <section id="configurator" className="bg-slate-900 text-white py-16 lg:py-24 border-y border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sliders className="h-4 w-4" />
            {t('navConfigurator')}
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">
            {t('configuratorTitle')}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t('configuratorSubtitle')}
          </p>
        </div>

        {/* Configurator Box */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile & Color Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Select Profile */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-xl">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>1. {t('selectProfile')}</span>
                <span className="text-[10px] text-slate-400 font-normal">WDS Profielen</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {WINDOW_PROFILES.map((profile) => {
                  const isSelected = selectedProfile.id === profile.id;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileChange(profile)}
                      className={`relative text-left p-3.5 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-sm text-emerald-400">{profile.series}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{profile.chambers} Kamers • {profile.depthMm}mm</div>
                      <div className="text-[11px] font-medium text-emerald-400 mt-1">Uw = {profile.uwValue}</div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Color & Texture */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-xl">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>2. {t('selectColor')}</span>
                <span className="text-[11px] text-slate-300 font-medium">{selectedColor.name[language]}</span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {selectedProfile.availableColors.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 scale-105'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                      title={color.name[language]}
                    >
                      {/* Color Swatch Circle */}
                      <div
                        className="h-10 w-10 rounded-lg shadow-inner border border-white/20 relative overflow-hidden transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: color.hex,
                          backgroundImage: color.texture === 'wood'
                            ? `repeating-linear-gradient(45deg, ${color.hex}, ${color.secondaryHex} 10px, ${color.hex} 20px)`
                            : color.texture === 'metallic'
                            ? `linear-gradient(135deg, ${color.hex}, ${color.secondaryHex}, ${color.hex})`
                            : 'none'
                        }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Check className="h-5 w-5 text-emerald-400 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-300 font-medium mt-1.5 line-clamp-1 text-center">
                        {color.name[language].split('(')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic SVG Window Preview & Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Interactive Visualizer Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl relative overflow-hidden">
              
              {/* Header inside visualizer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-emerald-400" />
                    {selectedProfile.series} — {selectedColor.name[language]}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live 2D Model • {selectedProfile.chambers} Kamers • {selectedProfile.depthMm}mm Profieldiepte
                  </p>
                </div>

                {/* Sash Open Toggle */}
                <button
                  onClick={() => setSashOpen(!sashOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:border-emerald-500/50 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {sashOpen ? 'Sluit Raamvleugel' : 'Open Raamvleugel (Kiep/Draai)'}
                </button>
              </div>

              {/* Dynamic SVG Render Canvas */}
              <div className="my-6 relative flex items-center justify-center min-h-[380px] rounded-xl bg-slate-900/80 p-8 border border-slate-800/80 shadow-inner overflow-hidden">
                
                {/* Background Wall Texture Simulation */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

                {/* Simulated Room Interior View through Glass */}
                <div className="absolute inset-12 bg-gradient-to-br from-slate-800/40 via-emerald-950/20 to-slate-900/60 rounded-md pointer-events-none"></div>

                {/* SVG Window Render */}
                <div className={`relative transition-transform duration-500 max-w-[340px] sm:max-w-[400px] w-full ${sashOpen ? 'perspective-1000' : ''}`}>
                  <svg
                    viewBox="0 0 400 320"
                    className="w-full h-auto drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))' }}
                  >
                    <defs>
                      {/* Frame Gradient based on selected color */}
                      <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={selectedColor.hex} />
                        <stop offset="50%" stopColor={selectedColor.secondaryHex || selectedColor.hex} />
                        <stop offset="100%" stopColor={selectedColor.hex} />
                      </linearGradient>

                      {/* Glass Reflection Gradient */}
                      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(186, 230, 253, 0.35)" />
                        <stop offset="35%" stopColor="rgba(224, 242, 254, 0.15)" />
                        <stop offset="70%" stopColor="rgba(186, 230, 253, 0.25)" />
                        <stop offset="100%" stopColor="rgba(125, 211, 252, 0.1)" />
                      </linearGradient>

                      {/* Wood Pattern Texture if applicable */}
                      <pattern id="woodPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="20" y2="20" stroke={selectedColor.secondaryHex || '#000'} strokeWidth="1" strokeOpacity="0.15" />
                      </pattern>
                    </defs>

                    {/* Outer Frame Wall Cutout Border */}
                    <rect x="10" y="10" width="380" height="300" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="3" />

                    {/* Outer Frame (Fixed) */}
                    <rect
                      x="20"
                      y="20"
                      width="360"
                      height="280"
                      rx="2"
                      fill="url(#frameGrad)"
                      stroke="#000"
                      strokeWidth="2"
                    />

                    {/* Outer Frame Inner Bevel Line */}
                    <rect x="36" y="36" width="328" height="248" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                    {/* Middle Vertical Mullion Profile */}
                    <rect x="193" y="20" width="14" height="280" fill="url(#frameGrad)" stroke="#000" strokeWidth="1" />

                    {/* Left Fixed Sash Pane */}
                    <g id="leftPane">
                      <rect x="38" y="38" width="153" height="244" fill="url(#frameGrad)" stroke="#000" strokeWidth="1.5" />
                      {/* Glass */}
                      <rect x="48" y="48" width="133" height="224" fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4" />
                      {/* Glass Diagonal Reflection */}
                      <polygon points="50,48 110,48 50,140" fill="rgba(255,255,255,0.2)" />
                      <polygon points="50,180 180,48 181,80 50,220" fill="rgba(255,255,255,0.08)" />
                    </g>

                    {/* Right Opening Sash (Draai-Kiep) */}
                    <g
                      id="rightSash"
                      className="transition-transform duration-500 origin-right"
                      style={{
                        transform: sashOpen ? 'rotateY(-25deg) scaleX(0.92)' : 'none',
                        transformOrigin: '360px 160px',
                      }}
                    >
                      <rect x="209" y="38" width="153" height="244" fill="url(#frameGrad)" stroke="#000" strokeWidth="2" />
                      {/* Inner Sash Frame Accent */}
                      <rect x="217" y="46" width="137" height="228" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      {/* Glass */}
                      <rect x="221" y="50" width="129" height="220" fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4" />
                      {/* Glass Reflection */}
                      <polygon points="223,50 290,50 223,150" fill="rgba(255,255,255,0.22)" />
                      <polygon points="223,180 348,50 349,80 223,220" fill="rgba(255,255,255,0.09)" />

                      {/* Silver Handle */}
                      <g transform="translate(222, 150)">
                        <rect x="0" y="0" width="6" height="24" rx="2" fill="#d1d5db" stroke="#374151" strokeWidth="1" />
                        <circle cx="3" cy="12" r="3" fill="#9ca3af" />
                        <rect x="-8" y="8" width="10" height="8" rx="1" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
                      </g>
                    </g>

                    {/* Bottom Sill Accent */}
                    <rect x="12" y="296" width="376" height="12" rx="1" fill="#1e293b" stroke="#000" strokeWidth="1" />
                  </svg>
                </div>

                {/* Color Badge Indicator */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-slate-950/90 border border-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-300 backdrop-blur-md">
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span>{selectedColor.name[language]}</span>
                </div>
              </div>

              {/* Live Technical Spec Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('chambersCount')}</div>
                  <div className="text-base font-black text-emerald-400">{selectedProfile.chambers} Kamers</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('depthMm')}</div>
                  <div className="text-base font-black text-white">{selectedProfile.depthMm} mm</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('uwValue')}</div>
                  <div className="text-base font-black text-emerald-400">{selectedProfile.uwValue}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('soundDb')}</div>
                  <div className="text-base font-black text-emerald-400">{selectedProfile.soundInsulationDb} dB</div>
                </div>
              </div>

              {/* Action Button: Add to Quote */}
              <div className="mt-6">
                <button
                  onClick={() =>
                    onSelectForQuote({
                      profile: selectedProfile,
                      color: selectedColor,
                      glass: selectedGlass,
                    })
                  }
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all"
                >
                  <span>{t('btnSaveConfig')}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

            </div>

            {/* Profile Description Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {selectedProfile.name} — {t('idealForLabel')}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProfile.description[language]}
              </p>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedProfile.features[language].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

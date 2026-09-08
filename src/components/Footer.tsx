import React from 'react';
import { useLanguage } from './LanguageContext';
import { Phone, Mail, Clock, ShieldCheck, Instagram, Facebook, MessageSquare, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 text-slate-900 border-t border-slate-200 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center cursor-pointer" onClick={scrollToTop}>
              <img 
                src="/logo.png" 
                alt="VicRenovation Logo" 
                className="h-10 sm:h-12 w-auto object-contain max-w-[220px]"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('footerAboutDesc')}
            </p>

            {/* Social Links */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('footerSocialTitle')} (VicRenovation)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/vicrenovation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-500 shadow-2xs transition-all"
                >
                  <Instagram className="h-4 w-4 text-emerald-600" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/Vicrenovation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-500 shadow-2xs transition-all"
                >
                  <Facebook className="h-4 w-4 text-emerald-600" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800">
              Diensten
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="hover:text-emerald-700 transition-colors">WDS 8S Passiefhuis Ramen</li>
              <li className="hover:text-emerald-700 transition-colors">WDS 7S Premium Kozijnen</li>
              <li className="hover:text-emerald-700 transition-colors">WDS 6S & 5S Profielen</li>
              <li className="hover:text-emerald-700 transition-colors">Interieurrenovaties & Keukens</li>
              <li className="hover:text-emerald-700 transition-colors">Luxe Badkamer Renovatie</li>
              <li className="hover:text-emerald-700 transition-colors">HSB-panelen (Houtskeletbouw)</li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800">
              {t('footerContactTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                <a href="tel:+31618886511" className="hover:text-emerald-700 font-medium">+31 6 18886511</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                <a href="mailto:info@vicrenovation.nl" className="hover:text-emerald-700 font-medium">info@vicrenovation.nl</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{t('footerHours')}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Action & WhatsApp */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800">
              Direct Contact
            </h4>
            
            <a
              href="https://wa.me/31618886511"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{t('whatsappBtn')}</span>
            </a>

            <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600 shadow-2xs">
              🛡️ Alle ramen en montagewerken worden geleverd met <span className="text-emerald-700 font-bold">10 jaar garantie</span>.
            </div>
          </div>

        </div>

        {/* Bottom copyright & scroll top */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <div>{t('footerCopyright')}</div>
            <a
              href="#admin"
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
              title="Admin Panel"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Admin</span>
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:text-slate-900 shadow-2xs transition-all"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Naar Boven</span>
          </button>
        </div>

      </div>
    </footer>
  );
};

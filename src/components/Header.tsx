import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Language } from '../types';
import { Phone, Mail, Clock, ShieldCheck, Lock, Menu, X, Check, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin?: () => void;
  onOpenQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenQuote }) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('configurator');

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const navItems = [
    { id: 'configurator', label: t('navConfigurator') },
    { id: 'windows', label: t('navWindows') },
    { id: 'interior', label: t('navInterior') },
    { id: 'hsb', label: t('navHSB') },
    { id: 'gallery', label: t('navGallery') },
    { id: 'contact', label: t('navContact') },
  ];

  useEffect(() => {
    const sectionIds = ['configurator', 'windows', 'interior', 'hsb', 'gallery', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220; // Offset for sticky header
      let current = '';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id;
            break;
          }
        }
      }
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 shadow-sm border-b border-slate-200/80">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:+31618886511" className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors font-medium">
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              +31 6 18886511
            </a>
            <span className="hidden md:inline-block text-slate-300">|</span>
            <a href="mailto:info@vicrenovation.nl" className="hidden md:flex items-center gap-1.5 hover:text-emerald-700 transition-colors font-medium">
              <Mail className="h-3.5 w-3.5 text-emerald-600" />
              info@vicrenovation.nl
            </a>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Language Switcher */}
            <div className="flex items-center rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={lang.label}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        {/* Brand Logo */}
        <div 
          onClick={() => scrollToSection('hero')}
          className="flex items-center cursor-pointer group select-none py-1"
        >
          <img 
            src="/logo.png" 
            alt="VicRenovation Logo" 
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform max-w-[220px]"
          />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-700">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isActive && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenQuote}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
          >
            {t('btnQuote')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4 animate-in slide-in-from-top-2 shadow-xl">
          <div className="flex flex-col gap-2 font-medium text-slate-700">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left py-2.5 px-3 rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white text-center shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              {t('btnQuote')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

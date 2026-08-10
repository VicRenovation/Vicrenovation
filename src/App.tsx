import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LanguageProvider } from './components/LanguageContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WindowConfigurator } from './components/WindowConfigurator';
import { WindowDetails } from './components/WindowDetails';
import { ServicesSection } from './components/ServicesSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { Gallery } from './components/Gallery';
import { QuoteSection } from './components/QuoteSection';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Footer } from './components/Footer';
import { WindowProfile, ColorFinish, GlassOption } from './types';

export default function App() {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedConfigForQuote, setSelectedConfigForQuote] = useState<{
    profile: WindowProfile;
    color: ColorFinish;
    glass: GlassOption;
  } | null>(null);

  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#admin') {
        setAdminModalOpen(true);
      }
    };

    checkAdminRoute();

    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminModalOpen(false);
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path === '/admin' || window.location.hash.toLowerCase() === '#admin') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectConfigForQuote = (config: {
    profile: WindowProfile;
    color: ColorFinish;
    glass: GlassOption;
  }) => {
    setSelectedConfigForQuote(config);
    const quoteElement = document.getElementById('contact');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenQuote = () => {
    const quoteElement = document.getElementById('contact');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        
        {/* Header Navigation */}
        <Header
          onOpenQuote={handleOpenQuote}
        />

        {/* Hero Banner */}
        <Hero onOpenQuote={handleOpenQuote} />

        {/* WDS & Aluminum 3D Interactive Configurator */}
        <WindowConfigurator onSelectForQuote={handleSelectConfigForQuote} />

        {/* Deep Dive Window Technology & Features */}
        <WindowDetails />

        {/* Interior Renovations & HSB Panelen Core Services */}
        <ServicesSection onOpenQuote={handleOpenQuote} />

        {/* Interactive Before & After Transformation Slider */}
        <BeforeAfterSection />

        {/* Project Gallery */}
        <Gallery />

        {/* Quote Request & Measurement Booking Form */}
        <QuoteSection preselectedConfig={selectedConfigForQuote} />

        {/* Admin Dashboard Modal */}
        <AdminPanelModal
          isOpen={adminModalOpen}
          onClose={handleCloseAdmin}
        />

        {/* Footer */}
        <Footer />

        {/* Vercel Speed Insights */}
        <SpeedInsights />

      </div>
    </LanguageProvider>
  );
}

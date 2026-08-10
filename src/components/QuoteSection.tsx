import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { ServiceCategory, WindowProfile, ColorFinish, GlassOption, QuoteRequest } from '../types';
import { Send, Phone, Calendar, CheckCircle2, FileText, Upload, Sparkles } from 'lucide-react';
import { saveQuoteToFirestore } from '../lib/firestoreService';

interface QuoteSectionProps {
  preselectedConfig?: {
    profile: WindowProfile;
    color: ColorFinish;
    glass: GlassOption;
  } | null;
}

export const QuoteSection: React.FC<QuoteSectionProps> = ({ preselectedConfig }) => {
  const { t } = useLanguage();

  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | 'combined'>('windows');
  const [dimensions, setDimensions] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone) return;

    setIsSubmitting(true);

    const newQuote: QuoteRequest = {
      id: 'quote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      clientName,
      email,
      phone,
      city,
      serviceCategory,
      details: {
        dimensions,
        additionalNotes: notes,
        ...(preselectedConfig ? {
          windowProfileId: preselectedConfig.profile.series,
          colorId: preselectedConfig.color.name.nl,
          glassOptionId: preselectedConfig.glass.name.nl,
        } : {}),
      },
      preferredDate,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveQuoteToFirestore(newQuote);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting quote:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-slate-900 text-white py-16 lg:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact & Information (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Send className="h-4 w-4" />
                Vrijblijvend Advies
              </div>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
                {t('quoteTitle')}
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                {t('quoteSubtitle')}
              </p>
            </div>

            {/* Preselected Config Badge if available */}
            {preselectedConfig && (
              <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-5 space-y-2">
                <div className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Geselecteerde Ramen Configuratie
                </div>
                <div className="text-sm font-extrabold text-white">
                  {preselectedConfig.profile.series} • {preselectedConfig.color.name.nl}
                </div>
                <div className="text-xs text-slate-300">
                  {preselectedConfig.glass.name.nl}
                </div>
              </div>
            )}

            {/* Key Service Guarantees */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gratis Inmeting op Locatie</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Onze vakmensen komen gratis bij u langs om de exacte maten op te nemen en advies te geven.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Snel Respons Binnen 24 Uur</h4>
                  <p className="text-xs text-slate-400 mt-0.5">U ontvangt een gedetailleerde prijsopgave zonder verborgen kosten.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">10 Jaar Garantie op Montage & Materialen</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Officiële garantie op verkleuring, luchtdichtheid en hang- en sluitwerk.</p>
                </div>
              </div>
            </div>

            {/* Direct Contact Options */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 text-xs text-slate-300">
              <div>📞 Direct bellen: <a href="tel:+31618886511" className="font-bold text-emerald-400 hover:underline">+31 6 18886511</a></div>
              <div>💬 WhatsApp: <a href="https://wa.me/31618886511" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-400 hover:underline">+31 6 18886511</a></div>
            </div>

          </div>

          {/* Right Column: Quote Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-10 w-10 stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Aanvraag Ontvangen!</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    {t('quoteSuccessMsg')}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-xl bg-slate-900 border border-slate-700 px-6 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    Nieuwe Aanvraag Versturen
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Offerte Formulier VicRenovation
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">{t('formName')} *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="bijv. Jan De Smet"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">{t('formPhone')} *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+32 / +31 ..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">{t('formEmail')}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="naam@voorbeeld.be"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">{t('formCity')}</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="bijv. Antwerpen / Gent / Rotterdam"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Service Choice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t('formService')}</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="windows">{t('formServiceWin')}</option>
                      <option value="interior">{t('formServiceInt')}</option>
                      <option value="hsb">{t('formServiceHSB')}</option>
                      <option value="combined">{t('formServiceComb')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dimensions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">{t('formDimensions')}</label>
                      <input
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        placeholder="bijv. 4 ramen 180x120 cm of 65 m²"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Date for Measurement */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">{t('formDate')}</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t('formNotes')}</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Beschrijf eventuele specifieke wensen, verdieping of vragen..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                    <span>{isSubmitting ? 'Bezig met versturen...' : t('btnSubmitQuote')}</span>
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

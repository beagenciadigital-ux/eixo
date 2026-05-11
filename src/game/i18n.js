import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default / unresolved → pt-BR; per-language key fallbacks avoid en → pt-BR.
    fallbackLng: (code) => {
      if (code === 'en') return ['en'];
      if (code === 'es') return ['es', 'en'];
      if (code === 'pt-BR') return ['pt-BR', 'en'];
      return ['pt-BR', 'en'];
    },
    // Only ship JSON under public/locales — missing locale folders cause the dev server to return HTML and JSON.parse fails.
    supportedLngs: ['en', 'es', 'pt-BR'],
    debug: false,
    ns: [
      'eras',
      'layout',
      'summary',
      'time',
      'diplomacy',
      'turns',
      'finance',
      'auth',
      'news',
      'pages',
      'guide',
      'settings',
      'races',
      'tour',
      'achievements',
      'legal',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Prefer saved choice, then site default (<html lang="pt-BR">), then browser.
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => {
        if (!lng) return lng;
        const lower = lng.toLowerCase();
        if (lower === 'pt' || lower.startsWith('pt-')) return 'pt-BR';
        return lng;
      },
    },
  });


export default i18n;

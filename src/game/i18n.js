import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    // Only ship JSON under public/locales — missing locale folders cause the dev server to return HTML and JSON.parse fails.
    supportedLngs: ['en', 'es', 'pt-BR'],
    debug: false,
    ns: ['eras','layout', 'summary', 'time', 'diplomacy', 'turns', 'finance', 'auth', 'news', 'pages', 'guide'],
    interpolation: {
      escapeValue: false
    }
  });


export default i18n;

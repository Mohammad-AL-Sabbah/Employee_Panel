import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد ملفات الترجمة
import translationAR from './locales/ar/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  ar: { translation: translationAR },
  en: { translation: translationEN }
};

i18n
  .use(LanguageDetector) // كشف اللغة تلقائياً
  .use(initReactI18next) // دمجها مع React
  .init({
    resources,
    fallbackLng: 'ar', // اللغة الاحتياطية إذا فشل الكشف
    lng: 'ar',         // اللغة الافتراضية عند التشغيل لأول مرة
    interpolation: {
      escapeValue: false // React يحمينا من XSS تلقائياً
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage'] // حفظ اختيار المستخدم في التخزين المحلي
    }
  });

export default i18n;
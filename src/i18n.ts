// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

// Safe way to get language from localStorage
const getSavedLanguage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lang") || "ru";
  }
  return "ru"; // default language
};

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: getSavedLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: "/locales/{{lng}}.json"
    }
  });

export default i18n;
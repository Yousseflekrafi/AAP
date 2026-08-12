import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en/translation.json";
import fr from "./fr/translation.json";

const storedLanguage = localStorage.getItem("aap-language");
const defaultLanguage = storedLanguage === "fr" || storedLanguage === "en"
  ? storedLanguage
  : navigator.language.startsWith("fr") ? "fr" : "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

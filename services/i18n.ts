import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "@/translations/en";
import fr from "@/translations/fr";
import es from "@/translations/es";

export const LANGUAGE_STORAGE_KEY = "MINISHOP_LANGUAGE";

export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export async function loadStoredLanguage() {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && Object.keys(resources).includes(stored)) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // ignore storage error
  }
}

export async function saveLanguage(code: string) {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // ignore storage error
  }
  return i18n.changeLanguage(code);
}

export default i18n;

import { initReactI18next } from "react-i18next";
import RNLanguageDetector from "@os-team/i18next-react-native-language-detector";
import i18n from "i18next";

import { i18nPreferences, setLanguageAfterInitialization } from "./shared";

i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    ...i18nPreferences,
    compatibilityJSON: "v3",
  })
  .then(setLanguageAfterInitialization);

export * from "./shared";

import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";

import { i18nPreferences, setLanguageAfterInitialization } from "./shared";

i18n
  .use(detector)
  .use(initReactI18next)
  .init(i18nPreferences)
  .then(setLanguageAfterInitialization);

export * from "./shared";

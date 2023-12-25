import { AsyncStorage } from "@coral-xyz/common";
import { changeLanguage, type InitOptions } from "i18next";

import en from "./locales/en/translation";
import hi from "./locales/hi/translation";
import zh from "./locales/zh/translation";

export * from "react-i18next";

export const SUPPORTED_LANGUAGES = [
  {
    key: "en",
    value: "English",
    nativeValue: "English",
  },
  {
    key: "hi",
    value: "Hindi",
    nativeValue: "हिन्दी",
  },
  {
    key: "zh",
    value: "Chinese",
    nativeValue: "中文",
  },
] as const;

export const updateLanguage = async (
  language: (typeof SUPPORTED_LANGUAGES)[number]["key"]
) =>
  new Promise((res, rej) => {
    changeLanguage(language, async (err) => {
      if (err) {
        rej(err);
      } else {
        try {
          await AsyncStorage.setItem("language", language);
          res(null);
        } catch (err) {
          rej(err);
        }
      }
    });
  });

export const i18nPreferences: InitOptions = {
  // this might not be necessary
  supportedLngs: ["en", "hi", "zh"],
  resources: {
    en: {
      translation: en,
    },
    hi: {
      translation: hi,
    },
    zh: {
      translation: zh,
    },
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
};

export const setLanguageAfterInitialization = async () => {
  const language = await AsyncStorage.getItem("language");
  if (language) {
    changeLanguage(language);
  }
};

import { AsyncStorage } from "@coral-xyz/common";
import { changeLanguage, type InitOptions } from "i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import kr from "./locales/kr.json";
import zh from "./locales/zh.json";

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
  {
    key: "kr",
    value: "Korean",
    nativeValue: "한국어",
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
  supportedLngs: ["en", "hi", "zh", "kr"],
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
    kr: {
      translation: kr,
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

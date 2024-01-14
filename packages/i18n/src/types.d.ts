import type en from "./locales/en/translation";

// Used for type-checking and autocomplete
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: {
      en: typeof en;
    };
  }
}

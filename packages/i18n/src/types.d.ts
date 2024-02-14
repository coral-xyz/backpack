import en from "./locales/en.json";

// Used for type-checking and autocomplete
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: {
      en: typeof en;
    };
  }
}

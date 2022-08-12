// Environment config.
export type Config = {
  BACKPACK_CONFIG_VERSION: string;
  BACKPACK_FEATURE_LIGHT_MODE: boolean;
  BACKPACK_FEATURE_POP_MODE: boolean;
};

export let CONFIG: Config;

// This should be called before using the entire package.
export function setConfig(c: Config) {
  CONFIG = c;
}

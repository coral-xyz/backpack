// Environment config.
export type ConfigPublic = {
  BACKPACK_CONFIG_LOG_LEVEL: string;
};

export let CONFIG_PUBLIC: ConfigPublic;

// This should be called before using the entire package.
export function setConfigPublic(c: ConfigPublic) {
  CONFIG_PUBLIC = c;
}

import { config } from "@coral-xyz/tamagui";

export type Conf = typeof config;

// @ts-expect-error
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;

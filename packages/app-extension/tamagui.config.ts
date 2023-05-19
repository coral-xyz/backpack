import { config } from "@coral-xyz/tamagui";

export type Conf = typeof config;

// @ts-expect-error
declare module "tamagui" {
  type TamaguiCustomConfig = Conf
}

export default config;

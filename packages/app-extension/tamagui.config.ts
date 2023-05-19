import { config } from "@coral-xyz/tamagui";

export type Conf = typeof config;

declare module "tamagui" {
  type TamaguiCustomConfig = Conf;
}

export default config;

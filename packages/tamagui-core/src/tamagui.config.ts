// import { createAnimations } from "@tamagui/animations-react-native";
// import { createInterFont } from "@tamagui/font-inter";
// import { createMedia } from "@tamagui/react-native-media-driver";
import { config as tconfig } from "@tamagui/config";
import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/theme-base";
import { createTamagui } from "tamagui";

// const animations = createAnimations({
//   bouncy: {
//     type: "spring",
//     damping: 10,
//     mass: 0.9,
//     stiffness: 100,
//   },
//   lazy: {
//     type: "spring",
//     damping: 20,
//     stiffness: 60,
//   },
//   quick: {
//     type: "spring",
//     damping: 20,
//     mass: 1.2,
//     stiffness: 250,
//   },
// });

// const headingFont = createInterFont();
// const bodyFont = createInterFont();
// export const config = createTamagui({
//   themes,
//   tokens,
//   shorthands,
// });

export const config = createTamagui(tconfig);
export type AppConfig = typeof config;
declare module "tamagui" {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  type TamaguiCustomConfig = AppConfig;
}

export default config;

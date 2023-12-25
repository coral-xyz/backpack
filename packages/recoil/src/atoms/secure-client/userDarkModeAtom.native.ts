import { Appearance } from "react-native";
import { atom } from "recoil";

export const userDarkModeAtom = atom<boolean>({
  key: "userDarkModeAtom",
  effects: [
    ({ setSelf }) => {
      const checkColorScheme = () => {
        const colorScheme = Appearance.getColorScheme();
        setSelf(colorScheme === "dark");
      };
      Appearance.addChangeListener(checkColorScheme);
      checkColorScheme();
    },
  ],
});

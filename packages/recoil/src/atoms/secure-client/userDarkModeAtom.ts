import { selector } from "recoil";

import { secureUserAtomNullable } from ".";

export const userDarkModeAtom = selector<boolean>({
  key: "userDarkModeAtom",
  get: async ({ get }) => {
    const user = get(secureUserAtomNullable);
    if (!user) {
      return true;
    }
    return true; // user.preferences.darkMode ?? false;
  },
});

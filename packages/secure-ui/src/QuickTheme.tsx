import type { ReactNode } from "react";

import { userDarkModeAtom } from "@coral-xyz/recoil";
import { Theme } from "@coral-xyz/tamagui";
import { useRecoilValueLoadable } from "recoil";

export function QuickTheme({ children }: { children: ReactNode }) {
  const darkModeLoadable = useRecoilValueLoadable(userDarkModeAtom);
  const darkMode = darkModeLoadable.getValue();

  return <Theme name={darkMode ? "dark" : "light"}>{children}</Theme>;
}

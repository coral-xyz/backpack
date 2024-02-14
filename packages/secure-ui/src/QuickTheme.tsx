import type { ReactNode } from "react";

import { userDarkModeAtom } from "@coral-xyz/recoil";
import { Theme } from "@coral-xyz/tamagui";
import { useRecoilValueLoadable } from "recoil";

export function QuickTheme({ children }: { children: ReactNode }) {
  return <Theme name="dark">{children}</Theme>;
}

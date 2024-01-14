import type { ReactNode } from "react";
import { Suspense } from "react";
import { EXTENSION_HEIGHT, EXTENSION_WIDTH } from "@coral-xyz/common";
import { useDarkMode } from "@coral-xyz/recoil";
import {
  config,
  LegacyMuiThemeProvider,
  TamaguiProvider,
} from "@coral-xyz/tamagui";

export const WithTheme = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<BlankNoTheme />}>
      <WithThemeMode>{children}</WithThemeMode>
    </Suspense>
  );
};

const WithThemeMode = ({ children }: { children: ReactNode }) => {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <LegacyMuiThemeProvider>{children}</LegacyMuiThemeProvider>
    </TamaguiProvider>
  );
};

// Used as a suspense fallback when loading the theme from the background.
const BlankNoTheme: React.FC = () => {
  return (
    <div
      style={{
        minWidth: `${EXTENSION_WIDTH}px`,
        minHeight: `${EXTENSION_HEIGHT}px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
};

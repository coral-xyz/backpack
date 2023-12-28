import { useRef } from "react";
import { EXTENSION_HEIGHT, EXTENSION_WIDTH } from "@coral-xyz/common";
import { Backpack } from "@coral-xyz/react-common";
import { OnboardingProvider, useKeyringStoreState } from "@coral-xyz/recoil";
import { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { RequireUserUnlocked } from "@coral-xyz/secure-ui";
import { useTheme as useTamaguiTheme, useTheme } from "@coral-xyz/tamagui";

import { OnboardAccount } from "./pages/OnboardAccount";

export const Onboarding = ({
  isAddingAccount,
}: {
  isAddingAccount?: boolean;
}) => {
  const containerRef = useRef();

  const _ks = useKeyringStoreState();

  const isOnboarded =
    !isAddingAccount && _ks !== KeyringStoreState.NeedsOnboarding;

  const defaultProps = {
    containerRef,
    // Props for the WithNav component
    navProps: {
      navbarStyle: {
        borderRadius: "12px",
      },
      navContentStyle: {
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
      },
    },
    isAddingAccount,
    isOnboarded,
  };
  const onboardAccounts = <OnboardAccount {...defaultProps} />;
  return (
    <OptionsContainer innerRef={containerRef}>
      <OnboardingProvider>
        <RequireUserUnlocked disabled={!isAddingAccount}>
          {onboardAccounts}
        </RequireUserUnlocked>
      </OnboardingProvider>
    </OptionsContainer>
  );
};

export function OptionsContainer({
  innerRef,
  children,
}: {
  innerRef?: any;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const tamaguiTheme = useTamaguiTheme();
  return (
    <div
      style={{
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          margin: "0 auto",
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
          width: "100vw",
          height: "100vh",
          background: tamaguiTheme.baseBackgroundL1.val,
        }}
      >
        <div
          style={{
            marginTop: -84,
            height: 84,
            opacity: 0.5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Backpack fill={theme.baseTextMedEmphasis.val} />
        </div>
        <div
          ref={innerRef}
          style={{
            width: `${EXTENSION_WIDTH}px`,
            height: `${EXTENSION_HEIGHT}px`,
            display: "flex",
            flexDirection: "column",
            margin: "0 auto",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
            background: tamaguiTheme.baseBackgroundL0.val,
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

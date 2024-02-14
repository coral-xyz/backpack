import { type ReactNode, useRef } from "react";
import { OnboardingProvider, useKeyringStoreState } from "@coral-xyz/recoil";
import { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { RequireUserUnlocked } from "@coral-xyz/secure-ui";
import { YStack } from "@coral-xyz/tamagui";

import { ConnectHardware } from "./pages/ConnectHardware";
import { OnboardAccount } from "./pages/OnboardAccount";

export const Onboarding = ({
  isAddingAccount,
  isConnectingHardware
}: {
  isAddingAccount?: boolean;
  isConnectingHardware?: boolean;
}) => {
  const containerRef = useRef();
  const _ks = useKeyringStoreState();

  const isOnboarded =
    !isAddingAccount && _ks !== KeyringStoreState.NeedsOnboarding;

  const defaultProps = {
    containerRef,
    // Props for the WithNav component
    navProps: {
      navbarStyle: {},
      navContentStyle: {},
    },
  };

  const onboardAccounts = isConnectingHardware ? (
    <ConnectHardware {...defaultProps} />
  ) : (
    <OnboardAccount
      {...defaultProps}
      isAddingAccount={isAddingAccount}
      isOnboarded={isOnboarded}
    />
  );

  return (
    <OptionsContainer innerRef={containerRef}>
      <OnboardingProvider>
        <RequireUserUnlocked disabled={!isAddingAccount} withMotion={false}>
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
  children: ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
      }}
    >
      <YStack
        alignItems="center"
        backgroundColor="$baseBackgroundL0"
        justifyContent="center"
        height="100vh"
        width="100vw"
      >
        <YStack
          ref={innerRef}
          alignItems="center"
          justifyContent="center"
          height={600}
          width={420}
        >
          {children}
        </YStack>
      </YStack>
    </div>
  );
}

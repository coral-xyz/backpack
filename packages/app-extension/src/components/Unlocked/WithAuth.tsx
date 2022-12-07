import { useEffect, useState } from "react";
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import type Transport from "@ledgerhq/hw-transport";
import { ethers } from "ethers";

import { useAuthentication } from "../../hooks/useAuthentication";
import { useSteps } from "../../hooks/useSteps";
import { Loading } from "../common";
import { WithDrawer } from "../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../common/Layout/Nav";
import { HardwareSearch } from "../Onboarding/pages/HardwareSearch";
import { HardwareSign } from "../Onboarding/pages/HardwareSign";
import { ConnectHardwareSearching } from "../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareWelcome } from "../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";

const { base58 } = ethers.utils;

export function WithAuth({ children }: { children: React.ReactElement }) {
  const [loading, setLoading] = useState(true);
  const [authSigner, setAuthSigner] = useState<{
    publicKey: string;
    blockchain: Blockchain;
    hardware: boolean;
  } | null>(null);
  const [authData, setAuthData] = useState<{
    blockchain: Blockchain;
    publicKey: string;
    message: string;
    signature: string;
  } | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const background = useBackgroundClient();
  const user = useUser();
  const { authenticate, checkAuthentication, getAuthSigner } =
    useAuthentication();
  const jwtEnabled = !!(
    BACKPACK_FEATURE_USERNAMES &&
    BACKPACK_FEATURE_JWT &&
    user
  );
  const signMessage = `Backpack login ${user.uuid}`;

  /**
   * Check authentication status and take required actions to authenticate if
   * not authenticated.
   */
  useEffect(() => {
    (async () => {
      if (!jwtEnabled) {
        // Already authenticated or not using JWTs
        setLoading(false);
      } else {
        const result = await checkAuthentication();
        if (result) {
          if (result.isAuthenticated) {
            setLoading(false);
          } else {
            setAuthSigner(
              await getAuthSigner(result.publicKeys.map((p) => p.publicKey))
            );
          }
        }
      }
    })();
    // Rerun authentication on user changes
  }, [user]);

  /**
   * When an auth signer is found, take the required action to get a signature.
   */
  useEffect(() => {
    (async () => {
      if (authSigner) {
        if (!authSigner.hardware) {
          // Auth signer is not a hardware wallet, sign transparent
          const signature = await background.request({
            method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
            params: [
              authSigner.blockchain,
              base58.encode(Buffer.from(signMessage, "utf-8")),
              authSigner.publicKey,
            ],
          });
          setAuthData({
            blockchain: authSigner.blockchain,
            publicKey: authSigner.publicKey,
            signature,
            message: signMessage,
          });
        } else {
          // Auth signer is a hardware wallet, pop up a drawer to guide through
          // flow
          setOpenDrawer(true);
        }
      }
    })();
  }, [authSigner]);

  /**
   * When an auth signature is created, authenticate with it.
   */
  useEffect(() => {
    (async () => {
      if (authData) {
        await authenticate(authData);
        setLoading(false);
        setOpenDrawer(false);
      }
    })();
  }, [authData]);

  return (
    <>
      {loading ? <Loading /> : children}
      {authSigner && (
        <WithDrawer
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          paperStyles={{
            height: "calc(100% - 56px)",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <HardwareAuthSigner
            blockchain={authSigner!.blockchain}
            publicKey={authSigner!.publicKey}
            signMessage={signMessage!}
            onSignature={(signature) => {
              setAuthData({
                blockchain: authSigner!.blockchain,
                publicKey: authSigner!.publicKey,
                message: signMessage!,
                signature,
              });
            }}
          />
        </WithDrawer>
      )}
    </>
  );
}

export function HardwareAuthSigner({
  blockchain,
  publicKey,
  signMessage,
  onSignature,
}: {
  blockchain: Blockchain;
  publicKey: string;
  signMessage: string;
  onSignature: (signature: string) => void;
}) {
  const theme = useCustomTheme();
  const { step, nextStep, prevStep, setStep } = useSteps();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError] = useState(false);
  const [signingAccount, setSigningAccount] = useState<{
    derivationPath: DerivationPath;
    accountIndex: number;
  } | null>();

  const steps = [
    <ConnectHardwareWelcome onNext={nextStep} />,
    <ConnectHardwareSearching
      blockchain={blockchain}
      onNext={(transport) => {
        setTransport(transport);
        nextStep();
      }}
      isConnectFailure={!!transportError}
    />,
    <HardwareSearch
      blockchain={blockchain!}
      transport={transport!}
      publicKey={publicKey!}
      onNext={(derivationPath: DerivationPath, accountIndex: number) => {
        setSigningAccount({ derivationPath, accountIndex });
        nextStep();
      }}
      onRetry={() => setStep(1)}
    />,
    ...(signingAccount
      ? [
          <HardwareSign
            blockchain={blockchain!}
            // TODO
            message={signMessage}
            publicKey={publicKey}
            derivationPath={signingAccount.derivationPath}
            accountIndex={signingAccount.accountIndex!}
            text="Sign the message to authenticate with Backpack"
            onNext={onSignature}
          />,
        ]
      : []),
  ];

  return (
    <WithNav
      navButtonLeft={
        step > 0 && step < steps.length - 1 ? (
          <NavBackButton onClick={prevStep} />
        ) : null
      }
      navbarStyle={{
        backgroundColor: theme.custom.colors.nav,
      }}
      navContentStyle={{
        backgroundColor: theme.custom.colors.nav,
        height: "400px",
      }}
    >
      {steps[step]}
    </WithNav>
  );
}

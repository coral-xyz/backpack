import { useEffect, useState } from "react";
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
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
  const { authenticate, checkAuthentication, getSigners } = useAuthentication();
  const jwtEnabled = !!(
    BACKPACK_FEATURE_USERNAMES &&
    BACKPACK_FEATURE_JWT &&
    user
  );

  const signMessage = authSigner
    ? base58.encode(Buffer.from(`Backpack login ${user.uuid}`, "utf-8"))
    : null;

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
  }, []);

  /**
   * When an auth signer is found, take the required action to get a signature.
   */
  useEffect(() => {
    (async () => {
      if (authSigner && signMessage) {
        if (!authSigner.hardware) {
          // Auth signer is not a hardware wallet, sign transparent
          const signature = await background.request({
            method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
            params: [authSigner.blockchain, signMessage, authSigner.publicKey],
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
  }, [authSigner, signMessage]);

  /**
   * When an auth signature is created, authenticate with it.
   */
  useEffect(() => {
    (async () => {
      if (authData) {
        const result = await authenticate(authData);
        console.log(result);
        setLoading(false);
      }
    })();
  }, [authData]);

  /**
   * Find the most suitable signer for signing an authentication message. The
   * most suitable signer is one that Backpack can sign with transparently
   * that has a matching public key on the server, or fall back to hardware
   * signers.
   */
  const getAuthSigner = async (serverPublicKeys: Array<String>) => {
    // Intersection of local signers with public keys stored on the server
    const signers = (await getSigners()).filter((k) =>
      serverPublicKeys.includes(k.publicKey)
    );

    if (signers.length === 0) {
      // This should never happen
      console.error("no valid auth signers found");
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
    // Try and find a transparent server (i.e. not hardware based) as the first
    // choice
    const transparentSigner = signers.find((s) => !s.hardware);
    // If no transparent signer, just return the first (hardware) signer
    return transparentSigner ? transparentSigner : signers[0];
  };

  if (!loading) return children;

  return (
    <>
      <Loading />
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
  onSignature,
}: {
  blockchain: Blockchain;
  publicKey: string;
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
    <HardwareSign
      blockchain={blockchain!}
      // TODO
      message="Login to Backpack"
      publicKey={publicKey!}
      derivationPath={signingAccount!.derivationPath}
      accountIndex={signingAccount!.accountIndex!}
      text="Sign the message to authenticate with Backpack"
      onNext={onSignature}
    />,
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

import { useEffect, useState } from "react";
import type Transport from "@ledgerhq/hw-transport";
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { WithDrawer } from "../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../common/Layout/Nav";
import { ConnectHardwareSearching } from "../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareWelcome } from "../Unlocked/Settings/AddConnectWallet/ConnectHardware/ConnectHardwareWelcome";
import { HardwareSearch } from "../Onboarding/pages/HardwareSearch";
import { HardwareSign } from "../Onboarding/pages/HardwareSign";
import { useSteps } from "../../hooks/useSteps";
import { useAuthentication } from "../../hooks/useAuthentication";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [authSigner, setAuthSigner] = useState<{
    publicKey: string;
    blockchain: Blockchain;
    hardware: boolean;
  } | null>(null);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const background = useBackgroundClient();
  const user = useUser();
  const { authenticate, checkAuthentication, getSigners } = useAuthentication();
  const jwtEnabled = !!(
    BACKPACK_FEATURE_USERNAMES &&
    BACKPACK_FEATURE_JWT &&
    user
  );

  /**
   * Check authentication status and take required actions to authenticate if
   * not authenticated.
   */
  useEffect(() => {
    (async () => {
      if (isAuthenticated || !jwtEnabled) {
        // Already authenticated or not using JWTs
        setLoading(false);
      } else {
        const result = await checkAuthentication();
        if (result && !result.isAuthenticated) {
          setAuthSigner(await getAuthSigner(result.publicKeys));
        }
      }
    })();
  }, []);

  /**
   * When an auth signer is found, take the required action to get a signature.
   */
  useEffect(() => {
    (async () => {
      if (authSigner && !authSigner.hardware) {
        // Auth signer is not a hardware wallet, sign transparent
        const signature = await background.request({
          method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
          params: [authSigner.blockchain, "onboard", authSigner.publicKey],
        });
        setAuthSignature(signature);
      } else if (authSigner) {
        // Auth signer is a hardware wallet, pop up a drawer to guide through
        // flow
        setOpenDrawer(true);
      }
    })();
  }, [authSigner]);

  /**
   * When an auth signature is created, authenticate with it.
   */
  useEffect(() => {
    (async () => {
      if (authSignature) {
        await authenticate(authSignature);
        setIsAuthenticated(true);
        setLoading(false);
      }
    })();
  }, [authSignature]);

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
      throw new Error("no valid auth signers found");
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
          onSignature={setAuthSignature}
        />
      </WithDrawer>
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
      publicKey={publicKey!}
      derivationPath={signingAccount!.derivationPath}
      accountIndex={signingAccount!.accountIndex!}
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

import { useEffect, useState } from "react";
import type Transport from "@ledgerhq/hw-transport";
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
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

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  // Public key/signature pairs that are required to sync the state of the
  // server public key data with the client data. A signature that is `undefined`
  // is one that has not been gathered yet, and a signature of `null` means the
  // user has opted to remove that public key from the server
  const [requiredSignatures, setRequiredSignatures] = useState<
    Array<{
      publicKey: string;
      signature: string | undefined | null;
      hardware: boolean;
    }>
  >([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const background = useBackgroundClient();
  const user = useUser();
  const jwtEnabled = !!(
    BACKPACK_FEATURE_USERNAMES &&
    BACKPACK_FEATURE_JWT &&
    user
  );

  useEffect(() => {
    (async () => {
      if (jwtEnabled) {
        const result = await checkAuthentication();
        if (result) {
          const { publicKeys, isAuthenticated } = await checkAuthentication();
          const publicKeysToAdd = await getRequiredSignatures(publicKeys);
          setIsAuthenticated(isAuthenticated);
          // Gather required signatures
          const signatures: typeof requiredSignatures = [];
          for (const data of publicKeysToAdd) {
            let signature: string | undefined;
            // If it's not a hardware publuc key, sign transparently now
            if (!data.hardware) {
              signature = await background.request({
                method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
                params: [data.blockchain, "onboard", data.publicKey],
              });
            }
            signatures.push({
              publicKey: data.publicKey,
              signature,
              hardware: data.hardware,
            });
          }
          setRequiredSignatures(signatures);
        }
      } else {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Iterate through the required signatures state and gather signatures either
   * by signing transparently or by displaying a drawer to the user to guide
   * them through the ledger flow.
   **/

  useEffect(() => {
    (async () => {
      // Get the next unresolves signature
      const nextIndex = requiredSignatures.findIndex(
        (s) => s.signature === undefined
      );
      // No more signatures needed
      if (nextIndex === -1) {
        // Job done
        console.log("job done");
        return;
      }

      const next = requiredSignatures[nextIndex];

      setOpenDrawer(true);
    })();
  }, [requiredSignatures]);

  /**
   * As soon as a valid signature becomes available, use it to create a JWT
   */
  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        const firstSignature = requiredSignatures.find((s) => !!s.signature);
        if (firstSignature) {
          console.log("authenticating");
          authenticate();
        }
      }
    })();
  }, [requiredSignatures]);

  /**
   * Query the server and see if the user has a valid JWT..
   */
  const checkAuthentication = async () => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/users/${user.username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 404) {
        // User does not exist on server, how to handle?
        throw new Error("user does not exist");
      }
      if (response.status !== 200) throw new Error(`could not fetch user`);
      return await response.json();
    } catch (err) {
      console.error("error checking authentication", err);
      // Relock if authentication failed
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
  };

  /**
   * Login the user.
   */
  const authenticate = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status !== 200) throw new Error(`could not authenticate`);
      return await response.json();
    } catch (err) {
      // Relock if authentication failed
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
  };

  /**
   * Determine the signatures that are required for authentication and for
   * ensuring all client side public keys are stored on the Backpack account.
   */
  const getRequiredSignatures = async (serverPublicKeys: Array<string>) => {
    type NamedPublicKeys = Array<{ name: string; publicKey: string }>;
    const clientPublicKeys = (await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
      params: [],
    })) as Record<
      Blockchain,
      {
        hdPublicKeys: NamedPublicKeys;
        importedPublicKeys: NamedPublicKeys;
        ledgerPublicKeys: NamedPublicKeys;
      }
    >;

    let publicKeysToAdd: Array<{
      publicKey: string;
      blockchain: Blockchain;
      hardware: boolean;
    }> = [];
    for (const [blockchain, data] of Object.entries(clientPublicKeys)) {
      publicKeysToAdd = publicKeysToAdd.concat([
        ...data.hdPublicKeys.map((n) => ({
          ...n,
          blockchain: blockchain as Blockchain,
          hardware: false,
        })),
        ...data.importedPublicKeys.map((n) => ({
          ...n,
          blockchain: blockchain as Blockchain,
          hardware: false,
        })),
        ...data.ledgerPublicKeys.map((n) => ({
          ...n,
          blockchain: blockchain as Blockchain,
          hardware: true,
        })),
      ]);
    }
    // Filter public keys that exist on the client but not on the server
    publicKeysToAdd = publicKeysToAdd.filter((k) =>
      serverPublicKeys.includes(k.publicKey)
    );

    return publicKeysToAdd;
  };

  if (!loading) return children;

  return (
    <>
      Authenticating
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        paperStyles={{
          height: "calc(100% - 56px)",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      ></WithDrawer>
    </>
  );
}

export function HardwareSigner({
  blockchain,
  publicKeys,
}: {
  blockchain: Blockchain;
  publicKeys: Array<string>;
}) {
  const theme = useCustomTheme();
  const { step, nextStep, prevStep, setStep } = useSteps();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
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
    // For each public key, add a step for searching for the public key on the
    // ledger and signing
    ...publicKeys.map((publicKey) => (
      <>
        <HardwareSearch
          blockchain={blockchain!}
          transport={transport!}
          publicKey={publicKey!}
          onNext={(derivationPath: DerivationPath, accountIndex: number) => {
            setSigningAccount({ derivationPath, accountIndex });
            nextStep();
          }}
          onRetry={() => setStep(1)}
        />
        <HardwareSign
          blockchain={blockchain!}
          publicKey={publicKey!}
          derivationPath={signingAccount!.derivationPath}
          accountIndex={signingAccount!.accountIndex!}
          onNext={(signature: string) => {
            nextStep();
          }}
        />
      </>
    )),
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

import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";

export function WithSyncAccount({
  jwtEnabled,
  serverPublicKeys,
  clientPublicKeys,
  children,
}: {
  jwtEnabled: boolean;
  serverPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
  clientPublicKeys: Array<{
    blockchain: Blockchain;
    publicKey: string;
    hardware: boolean;
  }>;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  // Public key/signature pairs that are required to sync the state of the
  // server public key data with the client data. A signature that is `undefined`
  // is one that has not been gathered yet, and a signature of `null` means the
  // user has opted to remove that public key from the server
  const [requiredSignatures, setRequiredSignatures] = useState<
    Array<{
      blockchain: Blockchain;
      publicKey: string;
      signature: string | undefined | null;
      hardware: boolean;
    }>
  >(
    clientPublicKeys.map((c) => ({
      ...c,
      signature: undefined,
    }))
  );

  /**
   * Sign all transparently signable add messages with the required public keys.
   */
  useEffect(() => {
    (async () => {
      if (jwtEnabled) {
        setLoading(false);
      } else {
        // No JWT enabled, finish
        setLoading(false);
      }
    })();
  }, []);
}

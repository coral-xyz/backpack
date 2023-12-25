import type { Blockchain } from "@coral-xyz/common";
import { BlockchainWalletType } from "@coral-xyz/secure-background/types";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import { useRecoilValue } from "recoil";

import { secureUserAtom, userClientAtom } from "../atoms";

export function useCreateNewWallet(blockchain: Blockchain) {
  const userClient = useRecoilValue(userClientAtom);
  const user = useRecoilValue(secureUserAtom);

  const createNewWithPhrase = async (): Promise<{ publicKey: string }> => {
    // Mnemonic based keyring. This is the simple case because we don't
    // need to prompt for the user to open their Ledger app to get the
    // required public key. We also don't need a signature to prove
    // ownership of the public key because that can't be done
    // transparently by the backend.

    // await safeClientResponse(userClient.unlockKeyring());

    const wallet = await safeClientResponse(
      userClient.initWallet({
        uuid: user.user.uuid,
        blockchainWalletInits: [
          {
            type: BlockchainWalletType.MNEMONIC_NEXT,
            blockchain,
          },
        ],
      })
    );

    return { publicKey: wallet.wallets[0].publicKey };
  };

  return { createNewWithPhrase };
}

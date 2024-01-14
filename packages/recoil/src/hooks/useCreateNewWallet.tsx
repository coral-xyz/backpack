import type { Blockchain } from "@coral-xyz/common";
import type {
  BlockchainWalletDescriptor,
  BlockchainWalletDescriptorType,
} from "@coral-xyz/secure-background/types";
import {
  BlockchainWalletInitType,
  BlockchainWalletPreviewType,
} from "@coral-xyz/secure-background/types";
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
    const preview = await safeClientResponse(
      userClient.previewWallets({
        type: BlockchainWalletPreviewType.MNEMONIC_NEXT,
        blockchain,
      })
    );
    const descriptor = preview.wallets[0]
      .walletDescriptors[0] as BlockchainWalletDescriptor<BlockchainWalletDescriptorType.MNEMONIC>;
    const wallet = await safeClientResponse(
      userClient.initWallet({
        uuid: user.user.uuid,
        blockchainWalletInits: [
          {
            type: BlockchainWalletInitType.MNEMONIC,
            blockchain,
            publicKey: descriptor.publicKey,
            derivationPath: descriptor.derivationPath,
          },
        ],
      })
    );

    return { publicKey: wallet.wallets[0].publicKey };
  };

  return { createNewWithPhrase };
}

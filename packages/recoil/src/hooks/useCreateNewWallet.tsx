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

import { secureUserAtomNullable, userClientAtom } from "../atoms";

export function useCreateNewWallet(blockchain: Blockchain) {
  const userClient = useRecoilValue(userClientAtom);
  const user = useRecoilValue(secureUserAtomNullable);

  const createNewWithPhrase = async (
    mnemonic?: string
  ): Promise<{ publicKey: string }> => {
    const preview = await safeClientResponse(
      userClient.previewWallets({
        type: BlockchainWalletPreviewType.MNEMONIC_NEXT,
        blockchain,
        mnemonic,
      })
    );
    const descriptor = preview.wallets[0]
      .walletDescriptors[0] as BlockchainWalletDescriptor<BlockchainWalletDescriptorType.MNEMONIC>;
    const wallet = await safeClientResponse(
      userClient.initWallet({
        uuid: user ? user.user.uuid : "",
        blockchainWalletInits: [
          {
            type: BlockchainWalletInitType.MNEMONIC,
            blockchain,
            mnemonic,
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

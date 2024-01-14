import { Blockchain } from "@coral-xyz/common";
import {
  getAssetProof,
  type SolanaAssetData,
  type SolanaAssetKind,
  type SolanaClient,
} from "@coral-xyz/secure-clients";
import {
  isCardinalWrappedToken,
  isProgrammableNftToken,
} from "@coral-xyz/secure-clients/legacyCommon";
import { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";
import { PublicKey } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import { blockchainClientAtom } from "../../atoms";

import { useSolanaTokenMint } from ".";

// We use this as a perf optimization to pre-fetch the nft type so that we don't have
// to do this after the user clicks the send button.
//
// TODOs:
//   - Consider exporting this from the secure-client package, instead.
//
export function useAssetKindAndData(
  ctx: { publicKey: string; blockchain: Blockchain },
  nft: {
    address: string;
    compressed: boolean;
    compressionData?: { tree?: string };
    token?: string;
  },
  isBurn?: boolean
): Promise<{ kind: SolanaAssetKind; data?: SolanaAssetData } | undefined> {
  const client = useRecoilValue(blockchainClientAtom(ctx.blockchain));
  const mintInfo = useSolanaTokenMint({
    publicKey: ctx.publicKey,
    tokenAddress: nft.token ?? "",
  });

  return (async () => {
    if (ctx.blockchain !== Blockchain.SOLANA) {
      return undefined;
    }

    try {
      const conn = (client as SolanaClient).connection;

      if (nft.compressed && nft.compressionData && nft.compressionData.tree) {
        const [assetProof, tree] = await Promise.all([
          getAssetProof(nft.address),
          ConcurrentMerkleTreeAccount.fromAccountAddress(
            conn,
            new PublicKey(nft.compressionData.tree),
            { commitment: conn.commitment ?? "confirmed" }
          ),
        ]);

        return {
          kind: "compressed",
          data: {
            assetProof,
            tree,
          },
        };
      }

      if (!isBurn) {
        if (await isProgrammableNftToken(conn, nft.address)) {
          return {
            kind: "programmable",
            data: undefined,
          };
        } else if (
          await isCardinalWrappedToken(
            conn,
            new PublicKey(nft.address),
            mintInfo
          )
        ) {
          return {
            kind: "cardinal-wrapped",
            data: undefined,
          };
        }
      }
    } catch (err) {
      // NOOP - the secure client will attempt them with an undefined kind input
      return undefined;
    }

    return undefined;
  })();
}

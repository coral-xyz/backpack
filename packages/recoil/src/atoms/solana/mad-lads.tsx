import * as anchor from "@coral-xyz/anchor";
import { Blockchain } from "@coral-xyz/common";
import { createStakeApi } from "@coral-xyz/soulbound";
import { splTokenProgram } from "@coral-xyz/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { selectorFamily } from "recoil";

import { activeWallet } from "../wallet";

import { anchorContext } from "./wallet";

export const madLadGold = selectorFamily<any | null, string>({
  key: "madLadGold",
  get:
    (_mintAddress) =>
    async ({ get }) => {
      const { blockchain, publicKey } = get(activeWallet);
      if (blockchain !== Blockchain.SOLANA) {
        return null;
      }
      const { provider, connectionUrl } = get(anchorContext);
      const stakeApi = createStakeApi(provider);
      const tokenApi = splTokenProgram({ provider });

      const mintAddress = new PublicKey(_mintAddress);
      const connection = new Connection(connectionUrl);

      const query = {
        // @ts-ignore
        user: new PublicKey(publicKey),
        nft: {
          // @ts-ignore
          mintAddress,
          // @ts-ignore
          metadataAddress: mintAddress, // Not used.
          // @ts-ignore
          masterEditionAddress: mintAddress, // Not used.
        },
      };

      const [
        rewardDistributorAccountInfo,
        rewardEntryAccountInfo,
        stakeEntryAccountInfo,
        goldPointsAccountInfo,
      ] = await anchor.utils.rpc.getMultipleAccounts(connection, [
        // @ts-ignore
        stakeApi.constants.REWARD_DISTRIBUTOR,
        // @ts-ignore
        await stakeApi.rewardEntryAddress(query),
        // @ts-ignore
        await stakeApi.stakeEntryAddress(query),
        // @ts-ignore
        await stakeApi.goldPointsAddress(query),
      ]);

      const rewardDistributor =
        stakeApi.anchor.rewardDistributor.coder.accounts.decode(
          "rewardDistributor",
          rewardDistributorAccountInfo?.account!.data!
        );

      const rewardEntry =
        stakeApi.anchor.rewardDistributor.coder.accounts.decode(
          "rewardEntry",
          rewardEntryAccountInfo?.account!.data!
        );

      const stakeEntry = stakeApi.anchor.stakePool.coder.accounts.decode(
        "stakeEntry",
        stakeEntryAccountInfo?.account!.data!
      );
      const goldTokenAccount = (() => {
        if (!goldPointsAccountInfo?.account!.data) {
          return null;
        }
        return tokenApi.coder.accounts.decode(
          "account",
          goldPointsAccountInfo?.account!.data!
        );
      })();

      const goldPoints = await stakeApi.readGoldPoints({
        ...query,
        accounts: {
          rewardDistributor,
          stakeEntry,
          rewardEntry,
          goldTokenAccount,
        },
      });

      return {
        isStaked: stakeEntry.amount.eq(new anchor.BN(1)),
        goldPoints,
      };
    },
});

import type { InflationReward, StakeActivationData } from "@solana/web3.js";
import { type BigNumberish, utils } from "ethers";
import { atom } from "recoil";

/**
 * Hides miniscule amounts of SOL
 * @example approximateAmount(0.00203928) = "0.002"
 * @param value BigNumberish amount of Solana Lamports
 */
export const approximateAmount = (value: BigNumberish, decimals = 5) => {
  const numStr = utils.formatUnits(value, 9);

  if (!numStr.includes(".")) {
    return numStr; // No decimal point, return as is
  }

  const [integerPart, decimalPart] = numStr.split(".");

  // Truncate to 5 digits or to the first non-zero after 5 digits
  let truncatedDecimal = decimalPart.slice(0, decimals);
  const remainingDecimal = decimalPart.slice(decimals);

  if (truncatedDecimal.match(/^0*$/)) {
    // Find the first non-zero digit after the 5th decimal
    const match = remainingDecimal.match(/[^0]/);
    if (match) {
      truncatedDecimal += remainingDecimal.slice(
        0,
        remainingDecimal.indexOf(match[0]) + 1
      );
    }
  }

  // Remove trailing zeros and decimal point if necessary
  truncatedDecimal = truncatedDecimal.replace(/0+$/, "");
  if (truncatedDecimal === "") {
    return integerPart;
  }

  return `${integerPart}.${truncatedDecimal}`;
};

export type ParsedStakeAccount = {
  context: {
    apiVersion: string;
    slot: number;
  };
  value: {
    data: {
      parsed: {
        info: {
          meta: {
            authorized: {
              staker: string;
              withdrawer: string;
            };
            lockup: {
              custodian: string;
              epoch: number;
              unixTimestamp: number;
            };
            rentExemptReserve: string;
          };
          stake: {
            creditsObserved: number;
            delegation: {
              activationEpoch: string;
              deactivationEpoch: string;
              stake: string;
              voter: string;
              warmupCooldownRate: number;
            };
          };
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
    space: number;
  };
};

export type StakeInfo = {
  validator?: {
    name?: string;
    icon?: string;
  };
  pubkey?: string;
  lamports?: number;
  rewards?: InflationReward | null;
  stakeAccount?: ParsedStakeAccount["value"]["data"]["parsed"]["info"];
  stakeActivation?: StakeActivationData;
  index?: number;
  can?: {
    merge: boolean;
  };
};

export const lamportsToSolAsString = (
  lamports: number | string,
  { approx = true, appendTicker = false, integerIfIsOneOrMore = false } = {}
) => {
  let str = approx
    ? approximateAmount(lamports.toString())
    : utils.formatUnits(lamports, 9);
  if (str === "0.0") {
    str = "0";
  }
  if (integerIfIsOneOrMore && !str.startsWith("0.")) {
    str = str.split(".")[0];
  }
  return appendTicker ? str.concat(" SOL") : str;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const stakeStateColor = {
  active: "$greenText",
  inactive: "$redText",
  activating: "$yellowText",
  deactivating: "$yellowText",
} as Record<StakeActivationData["state"], string>;

export const activeValidatorPubkeyAtom = atom<string>({
  key: "staking.activeValidator",
  default: "B6nDYYLc2iwYqY3zdmavMmU9GjUL2hf79MkufviM2bXv",
});

export const isMergeableStakeAccount = (
  publicKey: string,
  epoch?: number,
  accountToMergeInto?: StakeInfo
) => {
  const now = Date.now() / 1000;
  return (a: StakeInfo) => {
    let isMergeable = Boolean(
      a.stakeAccount &&
        a.stakeActivation &&
        epoch &&
        a.stakeActivation.state === "active" &&
        a.stakeAccount.meta.lockup.unixTimestamp < now &&
        a.stakeAccount.meta.lockup.epoch <= epoch &&
        a.stakeActivation.active > 0 &&
        a.stakeAccount.meta.authorized.withdrawer === publicKey
    );

    if (a.stakeAccount && accountToMergeInto?.stakeAccount) {
      isMergeable &&= Boolean(
        a.pubkey !== accountToMergeInto.pubkey &&
          a.stakeAccount.stake.delegation.voter ===
            accountToMergeInto.stakeAccount.stake.delegation.voter
      );
    }

    return isMergeable;
  };
};

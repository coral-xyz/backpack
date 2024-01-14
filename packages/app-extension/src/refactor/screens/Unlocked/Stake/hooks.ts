import { useEffect, useRef, useState } from "react";
import { useSolanaCtx } from "@coral-xyz/recoil";
import { PublicKey, StakeProgram } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import type { ParsedStakeAccount, StakeInfo } from "./shared";
import { isMergeableStakeAccount } from "./shared";

export type Validator = {
  id: string;
  name: string;
  details: string;
  url: string;
  icon?: string;
  info: {
    apy?: number;
    stake: number;
    commission: number;
    votePubkey: string;
    nodePubkey: string;
    lastVote: number;
  };
};

export const useEpochInfoQuery = () => {
  const { connection } = useSolanaCtx();
  return useQuery({
    queryKey: ["epochInfo"],
    queryFn: () => connection.getEpochInfo(),
  });
};

export const useInflationRewardsQuery = (publicKey: string) => {
  const { connection } = useSolanaCtx();
  const programAccountsQuery = useProgramAccountsQuery(publicKey);
  return useQuery({
    queryKey: ["staking", publicKey, "inflationRewards"],
    enabled: Boolean(programAccountsQuery.data),
    queryFn: async () => {
      const data = await connection.getInflationReward(
        programAccountsQuery.data!.map((a) => new PublicKey(a.pubkey))
      );
      return data.map(
        (x, i) => [programAccountsQuery.data![i].pubkey, x] as const
      );
    },
  });
};

export const useProgramAccountsQuery = (publicKey: string) => {
  const { connection } = useSolanaCtx();
  return useQuery({
    queryKey: ["staking", publicKey, "getProgramAccounts"],
    queryFn: async () => {
      const accs = await connection.getProgramAccounts(StakeProgram.programId, {
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              offset: 44,
              bytes: publicKey,
            },
          },
        ],
      });
      return accs.map((a) => ({
        pubkey: a.pubkey.toString(),
        lamports: a.account.lamports,
      }));
    },
  });
};

export const useSortedAccountsQuery = (publicKey: string) => {
  const { connection } = useSolanaCtx();

  const programAccountsQuery = useProgramAccountsQuery(publicKey);
  const inflationRewardsQuery = useInflationRewardsQuery(publicKey);

  // Fetch info for the stake accounts, add a sort index based on stake amount DESC
  const getParsedAccountInfo = useQuery({
    queryKey: ["staking", publicKey, "getParsedAccountInfo"],
    enabled: Boolean(programAccountsQuery.data),
    queryFn: async () => {
      const data = (
        await Promise.all(
          programAccountsQuery.data!.map(({ pubkey }) =>
            connection.getParsedAccountInfo(new PublicKey(pubkey), "processed")
          ) as unknown as readonly ParsedStakeAccount[]
        )
      )
        .map(({ value }, i) => ({ value, ...programAccountsQuery.data![i] }))
        .filter((a) => a?.pubkey && a?.value)
        .sort((a, b) => {
          const stakeDifference =
            Number(b!.value.data.parsed.info.stake.delegation.stake) -
            Number(a!.value.data.parsed.info.stake.delegation.stake);
          return stakeDifference === 0
            ? a!.pubkey.localeCompare(b!.pubkey)
            : stakeDifference;
        })
        .map((x, index) => ({ ...x, index } as const));
      return data;
    },
  });

  // Get the activation state of each stake account, e.g. 'active', 'inactive'
  const getStakeActivation = useQuery({
    queryKey: ["staking", publicKey, "getStakeActivation"],
    enabled: Boolean(programAccountsQuery.data),
    queryFn: async () => {
      const data = await Promise.allSettled(
        programAccountsQuery.data!.map(({ pubkey }) =>
          connection.getStakeActivation(new PublicKey(pubkey), "processed")
        )
      );
      return data.map((x, i) => {
        if (x.status === "fulfilled") {
          return [programAccountsQuery.data![i].pubkey, x.value] as const;
        }
      });
    },
  });

  const epoch = useEpochInfoQuery();

  const [accs, setAccs] = useState<Record<string, StakeInfo>>({});

  // Progressively merge the data from the queries above into an object, keyed by pubkey

  useEffect(() => {
    getParsedAccountInfo.data?.forEach(({ pubkey, ...stakeAccount }) => {
      setAccs((accs) => ({
        ...accs,
        [pubkey]: {
          ...(accs[pubkey] ?? {}),
          index: stakeAccount.index,
          lamports: stakeAccount.lamports,
          stakeAccount: stakeAccount.value?.data.parsed.info,
        },
      }));
    });
  }, [getParsedAccountInfo.data]);

  useEffect(() => {
    inflationRewardsQuery.data?.forEach(([pubkey, rewards]) => {
      setAccs((accs) => ({
        ...accs,
        [pubkey]: {
          ...(accs[pubkey] ?? {}),
          rewards,
        },
      }));
    });
  }, [inflationRewardsQuery.data]);

  useEffect(() => {
    getStakeActivation.data?.forEach((a) => {
      if (a) {
        const [pubkey, stakeActivation] = a;
        setAccs((accs) => ({
          ...accs,
          [pubkey]: {
            ...(accs[pubkey] ?? {}),
            stakeActivation,
          },
        }));
      }
    });
  }, [getStakeActivation.data]);

  // Filter out any accounts don't contain any lamports. This is important for removing
  // newly closed accounts, i.e. when a user unstakes & withdraws, or merges stakes
  const sortedAccounts = Object.entries(accs)
    .filter(
      ([pubkey]) =>
        programAccountsQuery.data?.find((p) => p.pubkey === pubkey)?.lamports
    )
    .map(([pubkey, rest]) => ({ pubkey, ...rest }))
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  // Build a temporary index of { [validator pubkey]: (# of mergeable stakes) }
  // that we can use below to signal whether or not a stake can be merged
  const voters: Record<string, number> = {};
  sortedAccounts
    .filter(isMergeableStakeAccount(publicKey, epoch.data?.epoch))
    .forEach((a) => {
      voters[a.stakeAccount!.stake.delegation.voter] ??= 0;
      voters[a.stakeAccount!.stake.delegation.voter] += 1;
    });

  return {
    /** `true` if enough data is available to start rendering this list */
    hasLoadedSomeData:
      getParsedAccountInfo.isFetched ||
      getStakeActivation.isFetched ||
      inflationRewardsQuery.isFetched,

    data: sortedAccounts.map((a) => {
      if (a.stakeAccount && a.stakeActivation && epoch.data) {
        const isMergeable =
          a.stakeActivation.state === "active" &&
          a.stakeAccount.stake.delegation.voter &&
          voters[a.stakeAccount.stake.delegation.voter] > 1;
        return {
          ...a,
          can: { merge: isMergeable },
        };
      } else {
        return a;
      }
    }),
  };
};

export const useValidatorsQuery = () =>
  useQuery({
    queryKey: ["staking", "validators"],
    refetchOnMount: false,
    queryFn: async () => {
      const res = await fetch("https://staking.xnfts.dev/v1/validators");
      const data = (await res.json()) as {
        createdAt: string;
        validators: ReadonlyArray<Validator>;
      };
      return data.validators;
    },
  });

/**
 * Like useAsyncEffect, use if doing a setState or navigating after await
 * @example
 * const isMounted = useIsMounted();
 * const onClick = async () => {
 *    await sleep(1000);
 *    if (isMounted.current) { navigation.goBack() }
 * };
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};

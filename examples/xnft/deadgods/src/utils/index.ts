import { useState, useEffect } from "react";
import ReactXnft, {
  LocalStorage,
  usePublicKey,
  useConnection,
} from "react-xnft";
import { PublicKey, Connection } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { IDL as IDL_GEM_BANK, GemBank } from "./idl-gem-bank";
import { IDL as IDL_GEM_FARM, GemFarm } from "./idl-gem-farm";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  fetchDegodTokens(window.xnft.publicKey, window.xnft.connection);
});

export function useStats(): any {
  const STATS = "https://api.degods.com/v1/stats";
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(STATS).then((resp) => {
      resp.json().then((r) => setStats(r));
    });
  }, []);
  return stats;
}

export function useDegodTokens() {
  const publicKey = usePublicKey();
  const connection = useConnection();

  const [tokenAccounts, setTokenAccounts] = useState<
    [any, any, any, any] | null
  >(null);
  useEffect(() => {
    (async () => {
      setTokenAccounts(null);
      const fetchAndSet = async () => {
        const res = await fetchDegodTokens(publicKey, connection);
        setTokenAccounts(res);
      };

      // Poll every 10 seconds for the latest tokens.
      fetchAndSet();
      setInterval(() => fetchAndSet(), 10000);
    })();
  }, [publicKey, connection]);
  if (tokenAccounts === null) {
    return null;
  }

  return {
    dead: tokenAccounts[0]
      .map((t) => ({ ...t, isStaked: true }))
      .sort((a, b) => a.publicKey.localeCompare(b.publicKey)),
    alive: tokenAccounts[1]
      .map((t) => ({ ...t, isStaked: true }))
      .sort((a, b) => a.publicKey.localeCompare(b.publicKey)),
    deadUnstaked: tokenAccounts[2]
      .map((t) => ({ ...t, isStaked: false }))
      .sort((a, b) => a.publicKey.localeCompare(b.publicKey)),
    aliveUnstaked: tokenAccounts[3]
      .map((t) => ({ ...t, isStaked: false }))
      .sort((a, b) => a.publicKey.localeCompare(b.publicKey)),
  };
}

export function useEstimatedRewards(): [string, (e: string) => void] {
  const [farmer, isLoading] = useFarmer(false);
  const [estimatedRewards, setEstimatedRewards] = useState("");

  useEffect(() => {
    // @ts-ignore
    (async () => {
      if (isLoading) {
        return;
      }
      try {
        const rewards = getEstimatedRewards(
          farmer.rewardA,
          farmer.gemsStaked,
          Date.now(),
          true
        );
        setEstimatedRewards(rewards.toFixed(4));
        const interval = setInterval(() => {
          const newRewards = getEstimatedRewards(
            farmer.rewardA,
            farmer.gemsStaked,
            Date.now(),
            true
          );
          setEstimatedRewards(newRewards.toFixed(4));
        }, 1000);
        return () => clearInterval(interval);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [farmer, isLoading]);

  return [estimatedRewards, setEstimatedRewards];
}

// @param withReload is true if we want to poll for a constant refresh.
export function useFarmer(withReload = true) {
  const publicKey = usePublicKey();
  const [[farmer, isLoading], setFarmerIsLoading] = useState<any>([
    [null, true],
  ]);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const client = gemFarmClient();
        const [farmerPubkey] = await PublicKey.findProgramAddress(
          [Buffer.from("farmer"), DEAD_FARM.toBuffer(), publicKey.toBuffer()],
          client.programId
        );
        const farmer = await client.account.farmer.fetch(farmerPubkey);
        setFarmerIsLoading([farmer, false]);
      } catch (err) {
        console.error(err);
        setFarmerIsLoading([null, false]);
      }
    };

    // Fetch the farmer account every 10 seconds to get state updates.
    fetchFarmer();
    if (withReload) {
      setInterval(() => fetchFarmer(), 10 * 1000);
    }
  }, []);

  return [farmer, isLoading];
}

export function gemBankClient(): Program<GemBank> {
  return new Program<GemBank>(IDL_GEM_BANK, PID_GEM_BANK, window.xnft);
}

export function gemFarmClient(): Program<GemFarm> {
  return new Program<GemFarm>(IDL_GEM_FARM, PID_GEM_FARM, window.xnft);
}

export async function fetchDegodTokens(
  wallet: PublicKey,
  connection: Connection
) {
  return await Promise.all([
    fetchStakedTokenAccounts(true, wallet, connection),
    fetchStakedTokenAccounts(false, wallet, connection),
    fetchTokenAccounts(wallet, connection),
    [], // todo
  ]);
}

async function fetchTokenAccounts(
  wallet: PublicKey,
  connection: Connection
): Promise<any> {
  const resp = await window.xnft.connection.customSplTokenAccounts(wallet);
  const tokens = resp.nftMetadata
    .map((m) => m[1])
    .filter((t) => t.tokenMetaUriData.name.startsWith("DeGod"));
  return tokens;
}

async function fetchStakedTokenAccounts(
  isDead: boolean,
  wallet: PublicKey,
  connection: Connection
): Promise<any> {
  const url = connection.rpcEndpoint;
  const cacheKey = `${url}:${isDead}:${wallet.toString()}`;
  const val = await LocalStorage.get(cacheKey);

  //
  // Only fetch this once every 10 seconds.
  //
  if (val) {
    const resp = JSON.parse(val);
    if (
      Object.keys(resp.value).length > 0 &&
      Date.now() - resp.ts < 1000 * 10
    ) {
      return await resp.value;
    }
  }

  const newResp = await fetchStakedTokenAccountsInner(
    isDead,
    wallet,
    connection
  );
  LocalStorage.set(
    cacheKey,
    JSON.stringify({
      ts: Date.now(),
      value: newResp,
    })
  );
  return newResp;
}

async function fetchStakedTokenAccountsInner(
  isDead: boolean,
  wallet: PublicKey,
  connection: Connection
) {
  const [vaultPubkey] = await PublicKey.findProgramAddress(
    [
      Buffer.from("vault"),
      isDead ? DEAD_BANK.toBuffer() : BANK.toBuffer(),
      wallet.toBuffer(),
    ],
    PID_GEM_BANK
  );

  const [vaultAuthority] = await PublicKey.findProgramAddress(
    [vaultPubkey.toBuffer()],
    PID_GEM_BANK
  );
  const tokenAccounts = await window.xnft.connection.customSplTokenAccounts(
    vaultAuthority
  );
  const newResp = tokenAccounts.nftMetadata
    .map((m) => m[1])
    .filter(
      (t) =>
        t.metadata &&
        t.metadata.data.creators &&
        t.metadata.data.creators.find(
          (c) =>
            c.verified &&
            c.address === "AxFuniPo7RaDgPH6Gizf4GZmLQFc4M5ipckeeZfkrPNn"
        ) !== undefined
    );

  return newResp;
}

export function getEstimatedRewards(
  reward: any,
  gems: any,
  currentTS: number,
  isDead: boolean = false
): Number {
  const DUST_RATE = isDead ? 15 : 5;
  return (
    (reward.accruedReward.toNumber() - reward.paidOutReward.toNumber()) /
      Math.pow(10, 9) +
    gems.toNumber() *
      DUST_RATE *
      ((currentTS / 1000 - reward.fixedRate.lastUpdatedTs.toNumber()) / 86400)
  );
}

export const EMPTY_DEGODS_ICON =
  "https://uploads-ssl.webflow.com/61f2155bfe47bd05cae702bb/61f21670d6560ecc93050888_New%20Logo.png";
export const DEGODS_ICON_DATA =
  "https://content.solsea.io/files/thumbnail/1632882828551-880453087-25B1476B-32ED-496E-AA86-35B687255916.jpeg";

const PID_GEM_FARM = new PublicKey(
  "FQzYycoqRjmZTgCcTTAkzceH2Ju8nzNLa5d78K3yAhVW"
);
export const PID_GEM_BANK = new PublicKey(
  "6VJpeYFy87Wuv4KvwqD5gyFBTkohqZTqs6LgbCJ8tDBA"
);
export const FARM = new PublicKey(
  "G9nFryoG6Cn2BexRquWa2AKTwcJfumWoDNLUwWkhXcij"
);
export const DEAD_FARM = new PublicKey(
  "8LbL9wfddTWo9vFf5CWoH979KowdV7JUfbBrnNdmPpk8"
);

const BANK = new PublicKey("EhRihAPeaR2jC9PKtyRcKzVwXRisykjt72ieYS232ERM");
export const DEAD_BANK = new PublicKey(
  "4iDK8akg8RHg7PguBTTsJcQbHo5iHKzkBJLk8MSvnENA"
);

export const METADATA_PID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

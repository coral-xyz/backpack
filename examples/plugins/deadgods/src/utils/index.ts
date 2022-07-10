import { PublicKey, Connection } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import AnchorUi from "@coral-xyz/anchor-ui";
import { customSplTokenAccounts } from "@coral-xyz/common";
import { IDL as IDL_GEM_BANK, GemBank } from "./idl-gem-bank";
import { IDL as IDL_GEM_FARM, GemFarm } from "./idl-gem-farm";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  fetchDegodTokens(window.anchorUi.publicKey, window.anchorUi.connection);
});

export function gemBankClient(): Program<GemBank> {
  return new Program<GemBank>(IDL_GEM_BANK, PID_GEM_BANK, window.backpack);
}

export function gemFarmClient(): Program<GemFarm> {
  return new Program<GemFarm>(IDL_GEM_FARM, PID_GEM_FARM, window.backpack);
}

export async function fetchDegodTokens(
  wallet: PublicKey,
  connection: Connection
) {
  return await Promise.all([
    fetchTokenAccounts(true, wallet, connection),
    fetchTokenAccounts(false, wallet, connection),
  ]);
}

async function fetchTokenAccounts(
  isDead: boolean,
  wallet: PublicKey,
  connection: Connection
): Promise<any> {
  const url = connection.rpcEndpoint;
  const cacheKey = `${url}:${isDead}:${wallet.toString()}`;
  const val = window.localStorage.getItem(cacheKey);

  //
  // Only fetch this once a minute.
  //
  if (val) {
    const resp = JSON.parse(val);
    if (
      Object.keys(resp.value).length > 0 &&
      Date.now() - resp.ts < 1000 * 60
    ) {
      return await resp.value;
    }
  }

  const newResp = fetchTokenAccountsInner(isDead, wallet, connection);
  window.localStorage.setItem(
    cacheKey,
    JSON.stringify({
      ts: Date.now(),
      value: newResp,
    })
  );
  return await newResp;
}

async function fetchTokenAccountsInner(
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
  const tokenAccounts = await customSplTokenAccounts(
    connection,
    vaultAuthority
  );
  const newResp = tokenAccounts.nftMetadata
    .map((m) => m[1])
    .filter((t) => !t.tokenMetaUriData.name.startsWith("DegodsGiveaway"));

  return newResp;
}

export const EMPTY_DEGODS_ICON =
  "https://uploads-ssl.webflow.com/61f2155bfe47bd05cae702bb/61f21670d6560ecc93050888_New%20Logo.png";
export const DEGODS_ICON_DATA =
  "https://content.solsea.io/files/thumbnail/1632882828551-880453087-25B1476B-32ED-496E-AA86-35B687255916.jpeg";

const PID_GEM_FARM = new PublicKey(
  "FQzYycoqRjmZTgCcTTAkzceH2Ju8nzNLa5d78K3yAhVW"
);
const PID_GEM_BANK = new PublicKey(
  "6VJpeYFy87Wuv4KvwqD5gyFBTkohqZTqs6LgbCJ8tDBA"
);
export const FARM = new PublicKey(
  "G9nFryoG6Cn2BexRquWa2AKTwcJfumWoDNLUwWkhXcij"
);
export const DEAD_FARM = new PublicKey(
  "8LbL9wfddTWo9vFf5CWoH979KowdV7JUfbBrnNdmPpk8"
);

const BANK = new PublicKey("EhRihAPeaR2jC9PKtyRcKzVwXRisykjt72ieYS232ERM");
const DEAD_BANK = new PublicKey("4iDK8akg8RHg7PguBTTsJcQbHo5iHKzkBJLk8MSvnENA");

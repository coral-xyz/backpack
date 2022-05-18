import React, { useMemo, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import {
  useNavigation,
  Text,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
} from "@200ms/anchor-ui";
import { GemFarm, IDL as IDL_GEM_FARM } from "./idl-gem-farm";
import { GemBank, IDL as IDL_GEM_BANK } from "./idl-gem-bank";
import { customSplTokenAccounts } from "@200ms/common";

export function App() {
  return <DegodsTable />;
}

function DegodsTable() {
  const nav = useNavigation();
  const [tokenAccounts, setTokenAccounts] = useState<any>(null);
  const gemFarm = useMemo(() => {
    return new Program<GemFarm>(IDL_GEM_FARM, PID_GEM_FARM, window.anchor);
  }, []);
  const gemBank = useMemo(() => {
    return new Program<GemBank>(IDL_GEM_BANK, PID_GEM_BANK, window.anchor);
  }, []);

  useEffect(() => {
    (async () => {
      const wallet = window.anchor.publicKey;
      const [dead, alive] = await Promise.all([
        fetchTokenAccounts(true, wallet),
        fetchTokenAccounts(false, wallet),
      ]);
      setTokenAccounts(dead.concat(alive));
    })();
  }, []);

  return (
    <BalancesTable>
      <BalancesTableHead title={"Staked Degods"} iconUrl={DEGODS_ICON_DATA} />
      {tokenAccounts === null ? (
        <BalancesTableContent></BalancesTableContent>
      ) : tokenAccounts.length === 0 ? (
        <BalancesTableContent>
          <BalancesTableRow onClick={() => nav.push(<StakeDetail />)}>
            <BalancesTableCell
              title={"Stake your Degods"}
              icon={EMPTY_DEGODS_ICON}
              subtitle={"Earn $DUST now"}
              usdValue={0}
            />
          </BalancesTableRow>
        </BalancesTableContent>
      ) : (
        <BalancesTableContent>
          {tokenAccounts.map((t) => {
            return (
              <BalancesTableRow onClick={() => nav.push(<StakeDetail />)}>
                <BalancesTableCell
                  title={t.tokenMetaUriData.name}
                  icon={t.tokenMetaUriData.image}
                  subtitle={t.tokenMetaUriData.collection.family}
                />
              </BalancesTableRow>
            );
          })}
        </BalancesTableContent>
      )}
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
}

function StakeDetail() {
  return <Text>Stake Detail Here</Text>;
}

async function fetchTokenAccounts(
  isDead: boolean,
  wallet: PublicKey
): Promise<any> {
  //
  // If we have a cached response, then use it.
  //
  const resp = CACHE.get(window.anchor.publicKey.toString());
  if (resp) {
    return resp;
  }

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
    window.anchor.connection,
    vaultAuthority
  );

  const newResp = tokenAccounts.nftMetadata.map((m) => m[1]);
  CACHE.set(window.anchor.publicKey.toString(), newResp);
  return newResp;
}

const EMPTY_DEGODS_ICON =
  "https://uploads-ssl.webflow.com/61f2155bfe47bd05cae702bb/61f21670d6560ecc93050888_New%20Logo.png";
const DEGODS_ICON_DATA =
  "https://content.solsea.io/files/thumbnail/1632882828551-880453087-25B1476B-32ED-496E-AA86-35B687255916.jpeg";
const PID_GEM_FARM = new PublicKey(
  "FQzYycoqRjmZTgCcTTAkzceH2Ju8nzNLa5d78K3yAhVW"
);
const PID_GEM_BANK = new PublicKey(
  "6VJpeYFy87Wuv4KvwqD5gyFBTkohqZTqs6LgbCJ8tDBA"
);
const FARM = new PublicKey("G9nFryoG6Cn2BexRquWa2AKTwcJfumWoDNLUwWkhXcij");
const DEAD_FARM = new PublicKey("8LbL9wfddTWo9vFf5CWoH979KowdV7JUfbBrnNdmPpk8");

const BANK = new PublicKey("EhRihAPeaR2jC9PKtyRcKzVwXRisykjt72ieYS232ERM");
const DEAD_BANK = new PublicKey("4iDK8akg8RHg7PguBTTsJcQbHo5iHKzkBJLk8MSvnENA");

//
// Caches requests.
//
const CACHE = new Map<string, any>();

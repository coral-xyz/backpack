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
      const ta = await fetchTokenAccounts(gemFarm, gemBank);
      setTokenAccounts(ta);
    })();
  }, [gemFarm, gemBank]);

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
              icon={
                "https://uploads-ssl.webflow.com/61f2155bfe47bd05cae702bb/61f21670d6560ecc93050888_New%20Logo.png"
              }
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
  gemFarm: Program<GemFarm>,
  gemBank: Program<GemBank>
): Promise<any> {
  //
  // If we have a cached response, then use it.
  //
  const resp = CACHE.get(window.anchor.publicKey.toString());
  if (resp) {
    return resp;
  }

  const farmers = await gemFarm.account.farmer.all([
    // Farm pubkey.
    {
      memcmp: {
        bytes: FARM.toString(),
        offset: 8,
      },
    },
    // Farmer authority
    {
      memcmp: {
        bytes: window.anchor.publicKey.toString(),
        offset: 8 + 32,
      },
    },
  ]);
  if (farmers.length === 0) {
    return [];
  }
  const farmer = farmers[0];
  const receipts = await gemBank.account.gemDepositReceipt.all([
    {
      memcmp: {
        bytes: farmer.account.vault.toString(),
        offset: 8,
      },
    },
  ]);

  if (receipts.length === 0) {
    return [];
  }

  const vault = await gemBank.account.vault.fetch(farmer.account.vault);
  const tokenAccounts = await customSplTokenAccounts(
    window.anchor.connection,
    vault.authority
  );

  const newResp = tokenAccounts.nftMetadata.map((m) => m[1]);
  CACHE.set(window.anchor.publicKey.toString(), newResp);
  return newResp;
}

const DEGODS_ICON_DATA =
  "https://content.solsea.io/files/thumbnail/1632882828551-880453087-25B1476B-32ED-496E-AA86-35B687255916.jpeg";
const PID_GEM_FARM = new PublicKey(
  "FQzYycoqRjmZTgCcTTAkzceH2Ju8nzNLa5d78K3yAhVW"
);
const PID_GEM_BANK = new PublicKey(
  "6VJpeYFy87Wuv4KvwqD5gyFBTkohqZTqs6LgbCJ8tDBA"
);
const FARM = new PublicKey("G9nFryoG6Cn2BexRquWa2AKTwcJfumWoDNLUwWkhXcij");

//
// Caches requests.
//
const CACHE = new Map<string, any>();

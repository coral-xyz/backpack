import React, { useMemo, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import {
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
} from "@200ms/anchor-ui";
import { GemFarm, IDL as IDL_GEM_FARM } from "./idl-gem-farm";
import { GemBank, IDL as IDL_GEM_BANK } from "./idl-gem-bank";
import { customSplTokenAccounts } from "./utils";

export function App() {
  return <DegodsTable />;
}

function DegodsTable() {
  const [tokenAccounts, setTokenAccounts] = useState<any>([]);
  const gemFarm = useMemo(() => {
    return new Program<GemFarm>(IDL_GEM_FARM, PID_GEM_FARM, window.anchor);
  }, []);
  const gemBank = useMemo(() => {
    return new Program<GemBank>(IDL_GEM_BANK, PID_GEM_BANK, window.anchor);
  }, []);

  useEffect(() => {
    (async () => {
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
        return;
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
        return;
      }

      const vault = await gemBank.account.vault.fetch(farmer.account.vault);
      const tokenAccounts = await customSplTokenAccounts(vault.authority);

      setTokenAccounts(tokenAccounts.nftMetadata.map((m) => m[1]));
    })();
  }, [gemFarm, gemBank]);

  return (
    <BalancesTable>
      <BalancesTableHead title={"Staked Degods"} iconUrl={DEGODS_ICON_DATA} />
      <BalancesTableContent>
        {tokenAccounts.map((t) => {
          return (
            <BalancesTableRow>
              <BalancesTableCell
                title={t.tokenMetaUriData.name}
                icon={t.tokenMetaUriData.image}
                subtitle={t.tokenMetaUriData.collection.family}
              />
            </BalancesTableRow>
          );
        })}
      </BalancesTableContent>
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
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

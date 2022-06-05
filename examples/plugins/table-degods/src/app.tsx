import { useMemo, useState, useEffect } from "react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import AnchorUi, {
  useNavigation,
  View,
  Image,
  Text,
  Button,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
} from "@200ms/anchor-ui";
import { customSplTokenAccounts } from "@200ms/common";
import { GemFarm, IDL as IDL_GEM_FARM } from "./idl-gem-farm";
import { GemBank, IDL as IDL_GEM_BANK } from "./idl-gem-bank";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  fetchRowData(window.anchorUi.publicKey);
});

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
      const tas = await fetchRowData(window.anchorUi.publicKey);
      setTokenAccounts(tas);
    })();
  }, [window.anchorUi.publicKey]);

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
          {/* TODO: Add estimated DUST */}
          {tokenAccounts.map((t) => {
            return (
              <BalancesTableRow
                key={t.publicKey.toString()}
                onClick={() => nav.push(<StakeDetail token={t} />)}
              >
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

function StakeDetail({ token }: any) {
  const unstake = async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: window.anchorUi.publicKey,
        toPubkey: window.anchorUi.publicKey,
        lamports: 1000000,
      })
    );
    console.log("plugin fetching most recent blockhash");
    const { blockhash } = await window.anchorUi.connection!.getLatestBlockhash(
      "recent"
    );
    console.log("plugin got recent blockhash", blockhash);
    tx.recentBlockhash = blockhash;
    const signature = await window.anchorUi.send(tx);
    console.log("test: got signed transaction here", signature);
  };
  return (
    <View>
      <Image
        src={token.tokenMetaUriData.image}
        style={{
          width: "343px",
          height: "343px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "16px",
          display: "block",
          borderRadius: "8px",
        }}
      />
      <View
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          width: "343px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Button
          onClick={() => unstake()}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "12px",
          }}
        >
          <Text>Unstake</Text>
        </Button>
      </View>
    </View>
  );
}

export async function fetchRowData(wallet: PublicKey) {
  const { blockhash } = await window.anchorUi.connection!.getLatestBlockhash(
    "recent"
  );
  console.log("here: plugin got recent blockhash", blockhash);

  const [dead, alive] = await Promise.all([
    fetchTokenAccounts(true, wallet),
    fetchTokenAccounts(false, wallet),
  ]);
  return dead.concat(alive);
}

async function fetchTokenAccounts(
  isDead: boolean,
  wallet: PublicKey
): Promise<any> {
  const cacheKey = `${isDead}:${window.anchorUi.publicKey.toString()}`;
  const resp = CACHE.get(cacheKey);
  if (resp) {
    return await resp;
  }
  const newResp = fetchTokenAccountsInner(isDead, wallet);
  CACHE.set(cacheKey, newResp);
  return await newResp;
}

async function fetchTokenAccountsInner(isDead: boolean, wallet: PublicKey) {
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
  console.log("armani: inside degods here", window.anchorUi.connection);
  const tokenAccounts = await customSplTokenAccounts(
    window.anchorUi.connection,
    vaultAuthority
  );
  const newResp = tokenAccounts.nftMetadata.map((m) => m[1]);

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
const CACHE = new Map<string, Promise<any>>();

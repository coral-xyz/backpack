import { useState, useEffect } from "react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
} from "@solana/web3.js";
import AnchorUi, {
  useNavigation,
  usePublicKey,
  useConnection,
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

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  fetchRowData(window.anchorUi.publicKey, window.anchorUi.connection);
});

export function App() {
  return <DegodsTable />;
}

function DegodsTable() {
  const nav = useNavigation();
  const publicKey = usePublicKey();
  const connection = useConnection();
  const [tokenAccounts, setTokenAccounts] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setTokenAccounts(null);
      const tas = await fetchRowData(publicKey, connection);
      setTokenAccounts(tas);
    })();
  }, [publicKey, connection]);

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
  const publicKey = usePublicKey();
  const connection = useConnection();
  const unstake = async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 1000000,
      })
    );
    console.log("plugin fetching most recent blockhash");
    const { blockhash } = await connection!.getLatestBlockhash("recent");
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

export async function fetchRowData(wallet: PublicKey, connection: Connection) {
  const [dead, alive] = await Promise.all([
    fetchTokenAccounts(true, wallet, connection),
    fetchTokenAccounts(false, wallet, connection),
  ]);
  return dead.concat(alive);
}

async function fetchTokenAccounts(
  isDead: boolean,
  wallet: PublicKey,
  connection: Connection
): Promise<any> {
  const url = connection.rpcEndpoint;
  const cacheKey = `${url}:${isDead}:${wallet.toString()}`;
  const resp = CACHE.get(cacheKey);
  if (resp) {
    return await resp;
  }
  const newResp = fetchTokenAccountsInner(isDead, wallet, connection);
  CACHE.set(cacheKey, newResp);
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

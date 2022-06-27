import { useState, useEffect } from "react";
import { Transaction, SystemProgram } from "@solana/web3.js";
import {
  usePublicKey,
  useConnection,
  useTheme,
  View,
  Image,
  Text,
  Button,
  Loading,
} from "@coral-xyz/anchor-ui";
import { fetchDegodTokens } from "./utils";

export function App() {
  const publicKey = usePublicKey();
  const connection = useConnection();
  const [tokenAccounts, setTokenAccounts] = useState<[any, any] | null>(null);

  useEffect(() => {
    (async () => {
      setTokenAccounts(null);
      const res = await fetchDegodTokens(publicKey, connection);
      setTokenAccounts(res);
    })();
  }, [publicKey, connection]);

  return tokenAccounts === null ? (
    <_Loading />
  ) : (
    <_App dead={tokenAccounts[0]} alive={tokenAccounts[1]} />
  );
}

function _Loading() {
  return (
    <View
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Loading
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </View>
  );
}

function _App({ dead, alive }: any) {
  return (
    <View>
      {dead.length > 0 && <GodGrid gods={dead} isDead={true} />}
      {/*alive.length > 0 && <GodGrid gods={alive} isDead={false} />*/}
    </View>
  );
}

function GodGrid({ gods, isDead }: any) {
  const theme = useTheme();
  const degodLabel = isDead ? "DeadGods" : "Degods";

  return (
    <View>
      <View
        style={{
          marginTop: "24px",
        }}
      >
        <Text
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: 500,
            lineHeight: "24px",
            color: theme.custom.colors.secondary,
          }}
        >
          Estimated Rewards
        </Text>
        <Text
          style={{
            fontSize: "14px",
            marginTop: "6px",
            textAlign: "center",
            fontWeight: 500,
            lineHeight: "24px",
          }}
        >
          719.2663 ({isDead ? 15 : 5} $DUST/day)
        </Text>
      </View>
      <View
        style={{
          marginTop: "20px",
          width: "268px",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Button style={{ flex: 1 }}>Unstake All</Button>
        <View style={{ width: "8px" }}></View>
        <Button style={{ flex: 1 }}>Claim $DUST</Button>
      </View>
      <View
        style={{
          marginTop: "38px",
        }}
      >
        <Text
          style={{
            marginBottom: "8px",
            fontSize: "14px",
            lineHeight: "24px",
            marginLeft: "12px",
            marginRight: "12px",
          }}
        >
          Staked {degodLabel}
        </Text>
        <View
          style={{
            display: "flex",
            background: theme.custom.colors.nav,
          }}
        >
          {gods.map((g) => {
            return (
              <Image src={g.tokenMetaUriData.image} style={{ width: "50%" }} />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function StakeDetail({ token }: any) {
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

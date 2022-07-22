import {
  usePublicKey,
  useConnection,
  useTheme,
  View,
  Image,
  Text,
  Button,
  NavStack,
  NavScreen,
} from "react-xnft";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { useDegodTokens } from "./utils";

export function Stake() {
  const isDead = false;
  const tokenAccounts = useDegodTokens()!;

  if (tokenAccounts === null) return <View></View>;

  return (
    <View
      style={{
        marginTop: "24px",
        marginBottom: "38px",
      }}
    >
      <GodGrid isDead={isDead} gods={tokenAccounts.dead} isStaked={true} />
      <GodGrid
        isDead={isDead}
        gods={tokenAccounts.deadUnstaked}
        isStaked={false}
      />
    </View>
  );
}

function GodGrid({ gods, isDead, isStaked }: any) {
  const theme = useTheme();
  const degodLabel = isDead ? "DeadGods" : "Degods";

  const clickGod = (god: any) => {
    console.log("clicked god", god);
  };

  return (
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
        {isStaked ? "Staked" : "Unstaked"} {degodLabel}
      </Text>
      <View
        style={{
          display: "flex",
          background: theme.custom.colors.nav,
        }}
      >
        {gods.map((g) => {
          return (
            <Button
              key={g.tokenMetaUriData.image}
              onClick={() => clickGod(g)}
              style={{
                padding: 0,
                width: "50%",
                height: "100%",
              }}
            >
              <Image src={g.tokenMetaUriData.image} style={{ width: "100%" }} />
            </Button>
          );
        })}
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

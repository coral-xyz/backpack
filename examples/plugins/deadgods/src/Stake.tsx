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
  Loading,
} from "react-xnft";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { useDegodTokens } from "./utils";
import { UnlockIcon, LockIcon } from "./utils/icon";

const STATS = "https://api.degods.com/v1/stats";

export function Stake() {
  return (
    <NavStack
      initialRoute={{ name: "stake" }}
      options={({ route }) => {
        switch (route.name) {
          case "stake":
            return {
              title: "My Gods",
            };
          default:
            throw new Error("unknown route");
        }
      }}
      style={{}}
    >
      <NavScreen
        name={"stake"}
        component={(props: any) => <StakeScreen {...props} />}
      />
    </NavStack>
  );
}

function StakeScreen() {
  const isDead = false;
  const tokenAccounts = useDegodTokens()!;

  if (tokenAccounts === null) {
    return <LoadingIndicator />;
  }

  return (
    <GodGrid
      isDead={isDead}
      staked={tokenAccounts.dead}
      unstaked={tokenAccounts.deadUnstaked}
      isStaked={true}
    />
  );
}

function GodGrid({ staked, unstaked, isDead }: any) {
  const clickGod = (god: any) => {
    console.log("clicked god", god);
  };

  const gods = (staked ?? []).concat(unstaked ?? []);
  console.log("gods here", gods);

  return (
    <View
      style={{
        marginBottom: "38px",
        marginRight: "20px",
        marginLeft: "20px",
      }}
    >
      <Text
        style={{
          fontSize: "12px",
        }}
      >
        🔥 Earn $DUST by staking your DeadGods
      </Text>
      <View
        style={{
          marginTop: "8px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {gods.map((g) => {
          return (
            <View>
              <Button
                key={g.tokenMetaUriData.image}
                onClick={() => clickGod(g)}
                style={{
                  padding: 0,
                  width: "150px",
                  height: "150px",
                  borderRadius: "6px",
                }}
              >
                <Image
                  src={g.tokenMetaUriData.image}
                  style={{
                    borderRadius: "6px",
                    width: "150px",
                  }}
                />
              </Button>
              <View
                style={{
                  marginTop: "3px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: "12px",
                    lineHeight: "19.08px",
                  }}
                >
                  ID {""}
                </Text>
                <View style={{ display: "flex" }}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      marginRight: "2px",
                    }}
                  >
                    {g.isStaked ? <LockIcon /> : <UnlockIcon />}
                  </View>
                  <Text
                    style={{
                      fontSize: "12px",
                      lineHeight: "19.08px",
                    }}
                  >
                    {g.isStaked ? "Staked" : "Unstaked"}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <Text
        style={{
          marginTop: "36px",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        👋 See more in Magic Eden
      </Text>
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

function LoadingIndicator() {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Loading
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      />
    </View>
  );
}

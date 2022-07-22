import {
  usePublicKey,
  useConnection,
  useTheme,
  useNavigation,
  View,
  Image,
  Text,
  Button,
  NavStack,
  NavScreen,
  Image,
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
          case "detail":
            return {
              title: route.props.god.tokenMetaUriData.name,
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
      <NavScreen
        name={"detail"}
        component={(props: any) => <DetailScreen {...props} />}
      />
    </NavStack>
  );
}

function DetailScreen({ god }) {
  const publicKey = usePublicKey();
  const connection = useConnection();

  console.log("god here", god);

  const stake = async () => {
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
    <View
      style={{
        marginRight: "20px",
        marginLeft: "20px",
      }}
    >
      <Image
        style={{
          marginBottom: "24px",
          display: "block",
          borderRadius: "6px",
          width: "335px",
          height: "335px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        src={god.tokenMetaUriData.image}
      />
      <Text
        style={{
          color: "rgba(255, 255, 255, 0.8)",
        }}
      >
        Description
      </Text>
      <Text
        style={{
          color: "#fff",
          marginBottom: "24px",
        }}
      >
        {god.tokenMetaUriData.description}
      </Text>
      {god.isStaked ? (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          onClick={() => unstake()}
        >
          Unstake
        </Button>
      ) : (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          onClick={() => stake()}
        >
          Stake
        </Button>
      )}
      <View
        style={{
          marginTop: "24px",
        }}
      >
        <Text
          style={{
            borderBottom: "solid 2pt #393C43",
            paddingBottom: "8px",
          }}
        >
          Attributes
        </Text>
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "16px",
            marginLeft: "-4px",
            marginRight: "-4px",
          }}
        >
          {god.tokenMetaUriData.attributes.map((attr) => {
            return (
              <View
                style={{
                  padding: "4px",
                }}
              >
                <View
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#292C33",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                >
                  <Text
                    style={{
                      color: "#99A4B4",
                      fontSize: "14px",
                    }}
                  >
                    {attr.trait_type}
                  </Text>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: "16px",
                    }}
                  >
                    {attr.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
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
  const nav = useNavigation();
  const clickGod = (god: any) => {
    nav.push("detail", { god });
  };

  const gods = (staked ?? []).concat(unstaked ?? []);

  return (
    <View
      style={{
        marginRight: "20px",
        marginLeft: "20px",
        marginBottom: "38px",
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
                  {g.tokenMetaUriData.name.slice("DeGod ".length)}
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

  const unstake = async () => {};

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

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
  Linking,
} from "react-xnft";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { useDegodTokens } from "./utils";
import { UnlockIcon, LockIcon } from "./utils/icon";
import { THEME } from "./theme";

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
          marginBottom: "10px",
        }}
      >
        {god.tokenMetaUriData.description}
      </Text>
      <Text>{god.tokenMetaUriData.external_url}</Text>
      {god.isStaked ? (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "24px",
            marginBottom: "24px",
            backgroundColor: THEME.colors.unstake,
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
            marginTop: "24px",
            marginBottom: "24px",
            backgroundColor: THEME.colors.stake,
          }}
          onClick={() => stake()}
        >
          Stake
        </Button>
      )}
      <View>
        <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>Attributes</Text>
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "4px",
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
  const publicKey = usePublicKey();
  const connection = useConnection();
  const nav = useNavigation();

  const clickGod = (god: any) => {
    nav.push("detail", { god });
  };
  const stakeAll = async () => {
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
  const unstakeAll = async () => {
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

  const gods = (staked ?? []).concat(unstaked ?? []);

  return (
    <View
      style={{
        marginRight: "20px",
        marginLeft: "20px",
        marginBottom: "38px",
      }}
    >
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
                  width: "157.5px",
                  height: "157.5px",
                  borderRadius: "6px",
                }}
              >
                <Image
                  src={g.tokenMetaUriData.image}
                  style={{
                    borderRadius: "6px",
                    width: "157.5px",
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
      <View
        style={{
          marginTop: "24px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          onClick={() => stakeAll()}
          style={{
            width: "100%",
            backgroundColor: THEME.colors.stake,
            marginBottom: "8px",
            height: "48px",
          }}
        >
          Stake All
        </Button>
        <Button
          onClick={() => unstakeAll()}
          style={{
            width: "100%",
            height: "48px",
            backgroundColor: THEME.colors.unstake,
          }}
        >
          Unstake All
        </Button>
      </View>
      <View
        onClick={() => {
          Linking.openLink("https://magiceden.io");
        }}
      >
        <Text
          style={{
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          👋 Browse Magic Eden
        </Text>
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

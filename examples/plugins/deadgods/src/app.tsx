import { useEffect } from "react";
import {
  usePublicKey,
  useConnection,
  useTheme,
  useNavigation,
  View,
  Image,
  Text,
  Button,
  Tabs,
  Tab,
  NavStack,
  NavScreen,
} from "react-xnft";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
  useDegodTokens,
  useEstimatedRewards,
  gemFarmClient,
  DEAD_FARM,
} from "./utils";

// TODO: checkpointing this now that we have the nav stack.
export function App() {
  const theme = useTheme();
  const tokenAccounts = useDegodTokens();
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: theme.custom.colors.background,
      }}
    >
      <NavStack
        initialRoute={{ name: "root" }}
        options={({ route }) => {
          switch (route.name) {
            case "root":
              return {
                title: "nav1",
              };
            case "root2":
              return { title: "nav2" };
            default:
              throw new Error("unknown route");
          }
        }}
        style={{}}
      >
        <NavScreen
          name={"root"}
          component={(props: any) => <InnerTab1 {...props} />}
        />
        <NavScreen
          name={"root2"}
          component={(props: any) => <InnerTab2 {...props} />}
        />
      </NavStack>
    </View>
  );
}

function InnerTab1() {
  const nav = useNavigation();

  return (
    <View
      style={{ color: "blue" }}
      onClick={() => {
        nav.push("root2");
      }}
    >
      Click me. TODO: checkpointing this now that we have the nav stack. Next is
      to make the degods design match figma.
    </View>
  );
}

function InnerTab2() {
  const nav = useNavigation();

  return (
    <View
      style={{ color: "red" }}
      onClick={() => {
        nav.push("root");
      }}
    >
      Click me 2
    </View>
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
      <Image
        src="https://www.deadgods.com/images/degods_bitmap.svg"
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </View>
  );
}

function _App() {
  const theme = useTheme();
  return (
    <Tabs
      options={({ route }) => {
        return {
          tabBarIcon: ({ focused }) => {
            const color = focused
              ? theme.custom.colors.activeNavButton
              : theme.custom.colors.secondary;
            if (route.name === "staked") {
              return <View></View>;
            } else {
              return <View></View>;
            }
          },
          tabBarActiveTintColor: theme.custom.colors.activeNavButton,
          tabBarInactiveTintColor: theme.custom.colors.secondary,
        };
      }}
    >
      <Tab name="staked" component={AppInner} />
      <Tab name="unstaked" component={InnerTab2} />
    </Tabs>
  );
}

function AppInner() {
  const isDead = false;
  const tokenAccounts = useDegodTokens()!;
  const estimatedRewards = useEstimatedRewards();

  if (tokenAccounts === null) return <View></View>;

  return (
    <View
      style={{
        marginTop: "24px",
        marginBottom: "38px",
      }}
    >
      <Header isDead={isDead} estimatedRewards={estimatedRewards} />
      <GodGrid isDead={isDead} gods={tokenAccounts.dead} isStaked={true} />
      <GodGrid
        isDead={isDead}
        gods={tokenAccounts.deadUnstaked}
        isStaked={false}
      />
    </View>
  );
}

function Header({ isDead, estimatedRewards }: any) {
  const theme = useTheme();
  const publicKey = usePublicKey();
  const connection = useConnection();

  const unstakeAll = () => {
    (async () => {
      console.log("here");
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
    })();
  };

  const claimDust = () => {
    (async () => {
      const farmClient = gemFarmClient();
      const rewardAMint = new PublicKey(
        "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"
      );
      const rewardBMint = new PublicKey(
        "So11111111111111111111111111111111111111112"
      );
      const [farmer, bumpFarmer] = await PublicKey.findProgramAddress(
        [Buffer.from("farmer"), DEAD_FARM.toBuffer(), publicKey.toBuffer()],
        farmClient.programId
      );
      const [farmAuthority, bumpAuth] = await PublicKey.findProgramAddress(
        [DEAD_FARM.toBuffer()],
        farmClient.programId
      );
      const [rewardAPot, bumpPotA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("reward_pot"),
          DEAD_FARM.toBuffer(),
          rewardAMint.toBuffer(),
        ],
        farmClient.programId
      );
      const [rewardBPot, bumpPotB] = await PublicKey.findProgramAddress(
        [
          Buffer.from("reward_pot"),
          DEAD_FARM.toBuffer(),
          rewardBMint.toBuffer(),
        ],
        farmClient.programId
      );

      try {
        const tx = await farmClient.methods
          .claim(bumpAuth, bumpFarmer, bumpPotA, bumpPotB)
          .accounts({
            farm: DEAD_FARM,
            farmAuthority,
            farmer,
            identity: publicKey,
            rewardAPot,
            rewardAMint,
            rewardADestination: await anchor.utils.token.associatedAddress({
              mint: rewardAMint,
              owner: publicKey,
            }),
            rewardBPot,
            rewardBMint,
            rewardBDestination: await anchor.utils.token.associatedAddress({
              mint: rewardBMint,
              owner: publicKey,
            }),
          })
          .transaction();
        const signature = await window.anchorUi.send(tx);
        console.log("tx signature", signature);
      } catch (err) {
        console.log("err here", err);
      }
    })();
  };
  return (
    <View>
      <View>
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
          {estimatedRewards} ({isDead ? 15 : 5} $DUST/day)
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
        <Button onClick={unstakeAll} style={{ flex: 1 }}>
          Unstake All
        </Button>
        <View style={{ width: "8px" }}></View>
        <Button onClick={claimDust} style={{ flex: 1 }}>
          Claim $DUST
        </Button>
      </View>
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

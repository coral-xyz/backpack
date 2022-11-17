import { useNavigation, View, Image, Text, Button, Loading } from "react-xnft";
import { useDegodTokens } from "../utils";
import { UnlockIcon, LockIcon } from "../utils/icon";

export function GodGridScreen() {
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
        marginBottom: "38px",
      }}
    >
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {gods.map((g) => {
          return (
            <View
              style={{
                marginLeft: "20px",
                marginTop: "8px",
              }}
            >
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

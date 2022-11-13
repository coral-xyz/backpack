// import { Grid, Skeleton } from "@mui/material";
// import { Block, Image as ImageIcon } from "@mui/icons-material";
import {
  toTitleCase,
  Blockchain,
  NftCollection,
  NAV_COMPONENT_NFT_DETAIL,
  NAV_COMPONENT_NFT_COLLECTION,
} from "@coral-xyz/common";
import {
  nftCollections,
  useActiveWallets,
  useBlockchainLogo,
  useEnabledBlockchains,
  useLoader,
  useNavigation,
} from "@coral-xyz/recoil";
import { View, Text, SectionList, Pressable } from "react-native";
import { useTheme } from "@hooks";
// import { GridCard } from "./Common";
// import { EmptyState } from "../../common/EmptyState";
// import {
//   BalancesTable,
//   BalancesTableContent,
//   BalancesTableHead,
// } from "../Balances";
// import EntryONE from "./EntryONE";
// import { useIsONELive } from "../../../hooks/useIsONELive";

function Header({ title }) {
  console.log("title", title);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: "yellow",
            marginRight: 12,
          }}
        />
        <Text>{title}</Text>
      </View>
      <View style={{ width: 32, height: 32, backgroundColor: "orange" }} />
    </View>
  );
}

function ListItem({ item }) {
  console.log("item", item);
  return <View style={{ backgroundColor: "yellow" }} />;
}

export default function NftCollectiblesScreen() {
  const isONELive = useIsONELive();
  const activeWallets = useActiveWallets();
  const enabledBlockchains = useEnabledBlockchains();

  const [collections, _, isLoading] = useLoader(
    nftCollections,
    Object.fromEntries(
      enabledBlockchains.map((b: Blockchain) => [b, new Array<NftCollection>()])
    ),
    // Note this reloads on any change to the active wallets, which reloads
    // NFTs for both blockchains.
    // TODO Make this reload for only the relevant blockchain
    [activeWallets]
  );

  const sections = Object.entries(collections).map(
    ([blockchain, collections]) => {
      return {
        title: toTitleCase(blockchain),
        data: collections,
      };
    }
  );

  return (
    <Screen>
      {isONELive && <EntryONE />}
      {Object.values(collections).flat().length === 0 && !isLoading ? (
        <EmptyState
          icon={(props: any) => <ImageIcon {...props} />}
          title={"No NFTs"}
          subtitle={"Get started with your first NFT"}
          buttonText={"Browse Magic Eden"}
          onClick={() => window.open("https://magiceden.io")}
          verticallyCentered={!isONELive}
        />
      ) : (
        <SectionList
          renderItem={({ item }) => <ListItem title={item} />}
          renderSectionHeader={({ section }) => (
            <Header title={section.title} />
          )}
          sections={sections}
        />
      )}
    </Screen>
  );
}

export function NftTable({
  blockchain,
  collections,
  isLoading,
}: {
  blockchain: Blockchain;
  collections: NftCollection[];
  isLoading: boolean;
}) {
  // const classes = useStyles();
  const theme = useTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const title = toTitleCase(blockchain);
  if (!isLoading && collections.length === 0) return <></>;
  // Note: the absolute positioning below is a total hack due to weird
  //       padding + overlap issues on the table head and its content.
  return (
    <BalancesTable style={{ position: "relative" }}>
      <BalancesTableHead props={{ title, iconUrl: blockchainLogo }} />
      <div className={classes.cardContentContainer}>
        <BalancesTableContent>
          <div>
            <div
              style={{
                backgroundColor: theme.custom.colors.nav,
                overflow: "hidden",
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
                {isLoading
                  ? [...Array(2)].map((_, i) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
                        <Skeleton
                          height={200}
                          style={{
                            borderRadius: "10px",
                            margin: "-20% 0",
                          }}
                        />
                      </Grid>
                    ))
                  : collections.map(
                      (collection: NftCollection, index: number) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                          <NftCollectionCard collection={collection} />
                        </Grid>
                      )
                    )}
              </Grid>
            </div>
          </div>
        </BalancesTableContent>
      </div>
    </BalancesTable>
  );
}

function NftCollectionCard({ collection }: { collection: NftCollection }) {
  const { push } = useNavigation();
  // Display the first NFT in the collection as the thumbnail in the grid
  const collectionDisplayNft = collection.items[0];

  const onPress = () => {
    if (collection.items.length === 1) {
      if (!collectionDisplayNft.name || !collectionDisplayNft.id) {
        throw new Error("invalid NFT data");
      }
      // If there is only one item in the collection, link straight to its detail page
      push({
        title: collectionDisplayNft.name || "",
        componentId: NAV_COMPONENT_NFT_DETAIL,
        componentProps: {
          nftId: collectionDisplayNft.id,
        },
      });
    } else {
      // Multiple items in connection, display a grid
      push({
        title: collection.name,
        componentId: NAV_COMPONENT_NFT_COLLECTION,
        componentProps: {
          id: collection.id,
        },
      });
    }
  };

  return (
    <View style={{ width: 150, height: 150, borderRadius: 20 }}>
      <Pressable onPress={onPress}></Pressable>
    </View>
  );
}

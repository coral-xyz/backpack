import { Grid, Skeleton } from "@mui/material";
import { Block, Image as ImageIcon } from "@mui/icons-material";
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
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { GridCard } from "./Common";
import { EmptyState } from "../../common/EmptyState";
import {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
} from "../Balances";
import EntryONE from "./EntryONE";
import { useIsONELive } from "../../../hooks/useIsONELive";

const useStyles = styles(() => ({
  cardContentContainer: {
    //    marginTop: "36px",
  },
}));

export function Nfts() {
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

  return (
    <>
      {Object.values(collections).flat().length === 0 && !isLoading ? (
        <>
          {!isONELive ? (
            <EmptyState
              icon={(props: any) => <ImageIcon {...props} />}
              title={"No NFTs"}
              subtitle={"Get started with your first NFT"}
              buttonText={"Browse Magic Eden"}
              onClick={() => window.open("https://magiceden.io")}
            />
          ) : (
            <div
              style={{
                borderRadius: "12px",
                paddingLeft: "16px",
                paddingRight: "16px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <EntryONE />
            </div>
          )}
        </>
      ) : (
        <>
          {isONELive && <EntryONE />}
          {Object.entries(collections).map(([blockchain, collections]) => (
            <NftTable
              key={blockchain}
              blockchain={blockchain as Blockchain}
              collections={collections as NftCollection[]}
              isLoading={isLoading}
            />
          ))}
        </>
      )}
    </>
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
  const classes = useStyles();
  const theme = useCustomTheme();
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

  const onClick = () => {
    if (collection.items.length === 1) {
      if (!collectionDisplayNft.name || !collectionDisplayNft.id) {
        throw new Error("invalid NFT data");
      }
      // If there is only one item in the collection, link straight to its detail page
      push({
        title: collectionDisplayNft.name,
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
    <GridCard
      onClick={onClick}
      nft={collectionDisplayNft}
      subtitle={{ name: collection.name, length: collection.items.length }}
    />
  );
}

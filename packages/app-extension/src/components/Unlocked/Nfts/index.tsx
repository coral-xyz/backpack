import { Grid } from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
import {
  toTitleCase,
  Blockchain,
  NftCollection,
  NAV_COMPONENT_NFT_DETAIL,
  NAV_COMPONENT_NFT_COLLECTION,
} from "@coral-xyz/common";
import {
  useBlockchainLogo,
  useEthereumNftCollections,
  useSolanaNftCollections,
  useNavigation,
} from "@coral-xyz/recoil";
import {
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableRow,
} from "@coral-xyz/react-xnft-renderer";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { GridCard } from "./Common";
import { EmptyState } from "../../common/EmptyState";

const useStyles = styles((theme) => ({
  cardContentContainer: {
    marginTop: "36px",
  },
}));

export function Nfts() {
  const solanaCollections = useSolanaNftCollections();
  const ethereumCollections = useEthereumNftCollections();

  const collections = {
    [Blockchain.SOLANA]: solanaCollections,
    [Blockchain.ETHEREUM]: ethereumCollections,
  };

  return (
    <>
      {Object.values(collections).flat().length === 0 ? (
        <EmptyState
          icon={(props: any) => <ImageIcon {...props} />}
          title={"No NFTs"}
          subtitle={"Get started with your first NFT"}
          buttonText={"Browse Magic Eden"}
          onClick={() => window.open("https://magiceden.io")}
        />
      ) : (
        Object.entries(collections).map(
          ([blockchain, collections]) =>
            collections.length > 0 && (
              <div
                style={{
                  marginTop: "2px",
                }}
              >
                <NftTable
                  key={blockchain}
                  blockchain={blockchain as Blockchain}
                  collections={collections}
                />
              </div>
            )
        )
      )}
    </>
  );
}

export function NftTable({
  blockchain,
  collections,
}: {
  blockchain: Blockchain;
  collections: NftCollection[];
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const title = toTitleCase(blockchain);
  // Note: the absolute positioning below is a total hack due to weird
  //       padding + overlap issues on the table head and its content.
  return (
    <BalancesTable style={{ position: "relative" }}>
      <BalancesTableHead
        props={{ title, iconUrl: blockchainLogo }}
        style={{
          position: "absolute",
          zIndex: 1,
          left: 0,
          right: 0,
          top: 0,
        }}
      />
      <div className={classes.cardContentContainer}>
        <BalancesTableContent>
          <div
            style={{
              backgroundColor: theme.custom.colors.nav,
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
              {collections.map((collection: NftCollection, index: number) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={collection.name}>
                  <NftCollectionCard key={index} collection={collection} />
                </Grid>
              ))}
            </Grid>
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

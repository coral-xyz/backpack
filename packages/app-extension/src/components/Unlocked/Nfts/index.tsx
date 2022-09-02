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
import { useCustomTheme } from "@coral-xyz/themes";
import { GridCard } from "./Common";
import { EmptyState } from "../../common/EmptyState";

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
              <NftTable
                key={blockchain}
                blockchain={blockchain as Blockchain}
                collections={collections}
              />
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
  const theme = useCustomTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const title = toTitleCase(blockchain);
  return (
    <BalancesTable>
      <BalancesTableHead props={{ title, iconUrl: blockchainLogo }} />
      <BalancesTableContent style={{ padding: "12px" }}>
        <div
          style={{
            backgroundColor: theme.custom.colors.nav,
            padding: "12px",
            flexWrap: "wrap",
          }}
        >
          {collections.map((collection: NftCollection, index: number) => (
            <NftCollectionCard key={index} collection={collection} />
          ))}
        </div>
      </BalancesTableContent>
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

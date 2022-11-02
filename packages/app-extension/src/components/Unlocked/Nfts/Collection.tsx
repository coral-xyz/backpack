import { Grid } from "@mui/material";
import {
  Blockchain,
  NftCollection,
  NAV_COMPONENT_NFT_DETAIL,
} from "@coral-xyz/common";
import { nftCollections, useLoader, useNavigation } from "@coral-xyz/recoil";
import { GridCard } from "./Common";

export function NftsCollection({ id }: { id: string }) {
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <_Grid id={id} />
    </div>
  );
}

function _Grid({ id }: { id: string }) {
  const [collections, _] = useLoader(nftCollections, {
    [Blockchain.SOLANA]: [] as NftCollection[],
    [Blockchain.ETHEREUM]: [] as NftCollection[],
  });

  const collection = Object.values(collections)
    .flat()
    .find((c: NftCollection) => c.id === id);

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (id === undefined || !collection) {
    return <></>;
  }

  return (
    <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
      {collection.items.map((nft: any, index: number) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
          <NftCard nft={nft} />
        </Grid>
      ))}
    </Grid>
  );
}

function NftCard({ nft }: any) {
  const { push } = useNavigation();
  const onClick = () => {
    push({
      title: nft.name || "",
      componentId: NAV_COMPONENT_NFT_DETAIL,
      componentProps: {
        nftId: nft.id,
      },
    });
  };
  return <GridCard onClick={onClick} nft={nft} />;
}

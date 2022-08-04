import { Grid } from "@mui/material";
import {
  NAV_COMPONENT_NFT_DETAIL,
  NAV_COMPONENT_NFT_COLLECTION,
} from "@coral-xyz/common";
import { useNavigation, useNftCollections } from "@coral-xyz/recoil";
import { GridCard } from "./Common";

export function Nfts() {
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <NftGrid />
    </div>
  );
}

function NftGrid() {
  const collections = useNftCollections();
  return (
    <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
      {collections.map((c: any) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={c.name}>
          <NftCollectionCard key={c.name} name={c.name} collection={c.items} />
        </Grid>
      ))}
    </Grid>
  );
}

function NftCollectionCard({
  name,
  collection,
}: {
  name: string;
  collection: any;
}) {
  const display = collection[0];
  const { push } = useNavigation();

  const onClick = () => {
    if (collection.length === 1) {
      if (!display.tokenMetaUriData.name || !display.publicKey) {
        throw new Error("invalid nft data");
      }
      push({
        title: display.tokenMetaUriData.name,
        componentId: NAV_COMPONENT_NFT_DETAIL,
        componentProps: {
          publicKey: display.publicKey,
        },
      });
    } else {
      push({
        title: name,
        componentId: NAV_COMPONENT_NFT_COLLECTION,
        componentProps: {
          name,
        },
      });
    }
  };

  return (
    <GridCard
      onClick={onClick}
      nft={display}
      subtitle={{ name, length: collection.length }}
    />
  );
}

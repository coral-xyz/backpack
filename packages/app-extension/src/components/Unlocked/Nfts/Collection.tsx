import type { NftCollectionWithIds } from "@coral-xyz/common";
import { Blockchain, NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import {
  nftById,
  nftCollectionsWithIds,
  useLoader,
  useNavigation,
} from "@coral-xyz/recoil";
import { Grid } from "@mui/material";
import type { UnwrapRecoilValue } from "recoil";
import { useRecoilValueLoadable } from "recoil";

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
  const { contents, state } = useRecoilValueLoadable<
    UnwrapRecoilValue<typeof nftCollectionsWithIds>
  >(nftCollectionsWithIds);
  const collections = (state === "hasValue" && contents) || null;
  const collection = Object.values(collections ?? {})
    .flat()
    .find((c: NftCollectionWithIds | null) => c?.id === id);

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (id === undefined || !collection) {
    return null;
  }

  return (
    <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
      {collection.items.map((nftId) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={nftId}>
          <NftCard nftId={nftId} />
        </Grid>
      ))}
    </Grid>
  );
}

function NftCard({ nftId }: { nftId: string }) {
  const { contents, state } = useRecoilValueLoadable(nftById(nftId));
  const nft = (state === "hasValue" && contents) || null;

  const { push } = useNavigation();
  const onClick = () => {
    push({
      title: nft?.name || "",
      componentId: NAV_COMPONENT_NFT_DETAIL,
      componentProps: {
        nftId,
      },
    });
  };
  return <GridCard onClick={onClick} nft={nft} />;
}

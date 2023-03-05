import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import {
  nftById,
  nftCollectionsWithIds,
  useNavigation,
} from "@coral-xyz/recoil";
import { Grid } from "@mui/material";
import type { UnwrapRecoilValue } from "recoil";
import { useRecoilValueLoadable } from "recoil";

import { NFTCard } from "./Common";

export function NftsCollection({
  publicKey,
  connectionUrl,
  id,
}: {
  publicKey: string;
  connectionUrl: string;
  id: string;
}) {
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <_Grid publicKey={publicKey} connectionUrl={connectionUrl} id={id} />
    </div>
  );
}

function _Grid({
  publicKey,
  connectionUrl,
  id,
}: {
  publicKey: string;
  connectionUrl: string;
  id: string;
}) {
  const { contents, state } = useRecoilValueLoadable<
    UnwrapRecoilValue<typeof nftCollectionsWithIds>
  >(nftCollectionsWithIds);
  const c = (state === "hasValue" && contents) || null;
  const collection = !c
    ? null
    : c
        .map((c: any) => c.collections!)
        .flat()
        .find((c: any) => c.id === id);

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (id === undefined || !collection) {
    return null;
  }

  return (
    <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
      {collection.itemIds.map((collectionId: string) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={collectionId}>
          <NftCard
            publicKey={publicKey}
            connectionUrl={connectionUrl}
            nftId={collectionId}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function NftCard({
  publicKey,
  connectionUrl,
  nftId,
}: {
  publicKey: string;
  connectionUrl: string;
  nftId: string;
}) {
  const { contents, state } = useRecoilValueLoadable(
    nftById({
      publicKey,
      connectionUrl,
      nftId,
    })
  );
  const nft = (state === "hasValue" && contents) || null;

  return <NFTCard nft={nft} />;
}

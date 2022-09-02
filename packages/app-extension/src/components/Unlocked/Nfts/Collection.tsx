import { Grid } from "@mui/material";
import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import {
  useNavigation,
  useSolanaNftCollections,
  useEthereumNftCollections,
} from "@coral-xyz/recoil";
import { GridCard } from "./Common";

export function NftsCollection({ name }: { name: string }) {
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <_Grid name={name} />
    </div>
  );
}

function _Grid({ name }: { name: string }) {
  const solanaCollections = useSolanaNftCollections();
  const ethereumCollections = useEthereumNftCollections();
  const collections = [...solanaCollections, ...ethereumCollections];
  const c = collections?.filter((col: any) => col.name === name)[0];

  // Hack: required due to framer-motion for some reason.
  if (name === undefined) {
    return <></>;
  }
  // Hack: required when looking at a collection not in the current wallet.
  if (!c) {
    return <></>;
  }

  return (
    <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
      {c.items.map((nft: any, index: number) => (
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
      title: nft.name,
      componentId: NAV_COMPONENT_NFT_DETAIL,
      componentProps: {
        nftId: nft.id,
      },
    });
  };
  return <GridCard onClick={onClick} nft={nft} />;
}

import { Grid } from "@mui/material";
import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { useNavigation, useNftCollections } from "@coral-xyz/recoil";
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
  const collections = useNftCollections();
  const c = collections?.filter((col: any) => col.name === name)[0];

  // Hack: required due to framer-motion for some reason.
  if (name === undefined) {
    return <></>;
  }

  return (
    <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
      {c.items.map((nft: any) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={nft.publickey.toString()}>
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
      title: nft.tokenMetaUriData.name,
      componentId: NAV_COMPONENT_NFT_DETAIL,
      componentProps: {
        publicKey: nft.publicKey,
      },
    });
  };
  return <GridCard onClick={onClick} nft={nft} />;
}

import makeStyles from "@mui/styles/makeStyles";
import { useNftMetadata, useNftMetadataAddresses } from "@coral-xyz/recoil";
import { useRootNav } from "../common/hooks";

const useStyles = makeStyles((theme: any) => ({
  nftImage: {
    width: "187px",
  },
}));

export function Nfts() {
  useRootNav();
  return <_Nfts blockchain={"solana"} />;
}

export function _Nfts({ blockchain }: any) {
  const nftMetadataAddresses = useNftMetadataAddresses(blockchain);
  return (
    <div style={{ flexWrap: "wrap", display: "flex" }}>
      {nftMetadataAddresses.map((address: string) => (
        <Nft key={address} address={address} />
      ))}
    </div>
  );
}

function Nft({ address }: any) {
  const classes = useStyles();
  const nftMetadata = useNftMetadata(address);
  return (
    <div style={{ height: "187px", overflow: "hidden" }}>
      <img
        src={nftMetadata.tokenMetaUriData.image}
        className={classes.nftImage}
      />
    </div>
  );
}

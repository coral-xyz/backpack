import { makeStyles } from "@material-ui/core";
import { useNftMetadata, useNftMetadataAddresses } from "@200ms/recoil";

const useStyles = makeStyles((theme: any) => ({
  nftImage: {
    width: "187px",
  },
}));

export function Nfts({ blockchain }: any) {
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

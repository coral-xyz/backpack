import { styles } from "@coral-xyz/themes";
import { useNftMetadata } from "@coral-xyz/recoil";

const useStyles = styles((theme) => ({
  nftImage: {
    width: "187px",
  },
}));

export function Nfts() {
  return <_Nfts />;
}

export function _Nfts() {
  const nftMetadata = useNftMetadata();
  return (
    <div style={{ flexWrap: "wrap", display: "flex" }}>
      {[...nftMetadata.entries()].map(([address, nftMetadata]) => {
        return <Nft nftMetadata={nftMetadata} />;
      })}
    </div>
  );
}

function Nft({ nftMetadata }: any) {
  const classes = useStyles();
  return (
    <div style={{ height: "187px", overflow: "hidden" }}>
      <img
        src={nftMetadata.tokenMetaUriData.image}
        className={classes.nftImage}
      />
    </div>
  );
}

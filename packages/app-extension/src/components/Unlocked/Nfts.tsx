import { styles } from "@coral-xyz/themes";
import { useNftMetadata, useNftMetadataAddresses } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";

const useStyles = styles((theme) => ({
  nftImage: {
    width: "187px",
  },
}));

export function Nfts() {
  return <_Nfts blockchain={Blockchain.SOLANA} />;
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

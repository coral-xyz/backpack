import { Image } from "react-native";
import { Blockchain } from "@coral-xyz/common";

// YES YOU'RE RIGHT THESE ARE HERE AND NOT SOMEWHERE ELSE!
// until we know the app-extension can handle relative import image paths or w/e, this stays in here on this url
const Images = {
  ethereumLogo:
    "https://s3.us-east-1.amazonaws.com/app-assets.xnfts.dev/images/useBlockchainLogo/ethereum.png",
  solanaLogo:
    "https://s3.us-east-1.amazonaws.com/app-assets.xnfts.dev/images/useBlockchainLogo/solana.png",
};

function getBlockchainLogo(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return Images.ethereumLogo;
    case Blockchain.SOLANA:
      return Images.solanaLogo;
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function BlockchainLogo({
  size = 24,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const uri = getBlockchainLogo(blockchain);
  return <Image source={{ uri }} style={{ width: size, height: size }} />;
}

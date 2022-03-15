import { useNftMetadata } from "../../../../hooks/useBlockchainBalances";

export function Nfts({ blockchain }: any) {
  const nftMetadata = useNftMetadata(blockchain);
  console.log("got nft metadata", nftMetadata);
  return (
    <div>
      {nftMetadata
        .filter((t: any) => t.tokenMetaUriData !== undefined)
        .map((nft: any) => (
          <Nft key={nft.publicKey.toString()} nftMetadata={nft} />
        ))}
    </div>
  );
}

function Nft({ nftMetadata }: any) {
  console.log("nftmetadata", nftMetadata);
  return (
    <img src={nftMetadata.tokenMetaUriData.image} style={{ width: "75px" }} />
  );
}

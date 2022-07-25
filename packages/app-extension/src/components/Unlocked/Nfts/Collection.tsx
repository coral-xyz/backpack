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
      <Grid name={name} />
    </div>
  );
}

function Grid({ name }: { name: string }) {
  const collections = useNftCollections();
  const c = collections?.filter((col: any) => col.name === name)[0];

  // Hack: required due to framer-motion for some reason.
  if (name === undefined) {
    return <></>;
  }

  return (
    <div
      style={{
        flexWrap: "wrap",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {c.items.map((nft: any) => (
        <NftCard nft={nft} />
      ))}
    </div>
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

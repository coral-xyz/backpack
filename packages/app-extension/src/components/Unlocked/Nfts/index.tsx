import {
  NAV_COMPONENT_NFT_DETAIL,
  NAV_COMPONENT_NFT_COLLECTION,
} from "@coral-xyz/common";
import { useNavigation, useNftCollections } from "@coral-xyz/recoil";
import { GridCard } from "./Common";

export function Nfts() {
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <NftGrid />
    </div>
  );
}

function NftGrid() {
  const collections = useNftCollections();
  return (
    <div
      style={{
        flexWrap: "wrap",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {collections.map((c: any) => (
        <NftCollectionCard name={c.name} collection={c.items} />
      ))}
    </div>
  );
}

function NftCollectionCard({
  name,
  collection,
}: {
  name: string;
  collection: any;
}) {
  const display = collection[0];
  const { push } = useNavigation();

  const onClick = () => {
    if (collection.length === 1) {
      if (!display.tokenMetaUriData.name || !display.publicKey) {
        throw new Error("invalid nft data");
      }
      push({
        title: display.tokenMetaUriData.name,
        componentId: NAV_COMPONENT_NFT_DETAIL,
        componentProps: {
          publicKey: display.publicKey,
        },
      });
    } else {
      push({
        title: name,
        componentId: NAV_COMPONENT_NFT_COLLECTION,
        componentProps: {
          name,
        },
      });
    }
  };

  return (
    <GridCard
      onClick={onClick}
      nft={display}
      subtitle={{ name, length: collection.length }}
    />
  );
}

import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { UserIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useNavigation,
} from "@coral-xyz/recoil";

import { GroupIdentifier } from "./GroupIdentifier";
import { SpotlightCell } from "./SpotlightCell";

export const SpotlightNfts = ({
  nfts,
  selectedIndex,
  setOpen,
}: {
  nfts: { name: string; image: string; id: string }[];
  selectedIndex: number | null;
  setOpen: any;
}) => {
  if (!nfts.length) return null;
  return (
    <div>
      <GroupIdentifier name="Collectibles" />
      {nfts.map((nft, index) => (
        <SpotlightNft
          selected={selectedIndex === index}
          nft={nft}
          setOpen={setOpen}
        />
      ))}
    </div>
  );
};

function SpotlightNft({
  nft,
  selected,
  setOpen,
}: {
  nft: { name: string; image: string; id: string };
  selected: boolean;
  setOpen: any;
}) {
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const { push } = useNavigation();

  return (
    <SpotlightCell
      selected={selected}
      onClick={() => {
        push({
          title: nft?.name,
          componentId: NAV_COMPONENT_NFT_DETAIL,
          componentProps: {
            nftId: nft.id,
            publicKey: activeWallet.publicKey,
            connectionUrl,
          },
        });
        setOpen(false);
      }}
    >
      <UserIcon size={55} image={nft.image} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {nft.name}
      </div>
    </SpotlightCell>
  );
}

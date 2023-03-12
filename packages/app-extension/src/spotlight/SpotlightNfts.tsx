import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { UserIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useNavigation,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { SELECTED_BLUE } from "./colors";
import { GroupIdentifier } from "./GroupIdentifier";

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

  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        padding: 12,
        background: selected ? SELECTED_BLUE : "",
        borderRadius: 8,
        color: theme.custom.colors.fontColor,
        cursor: "pointer",
      }}
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
    </div>
  );
}

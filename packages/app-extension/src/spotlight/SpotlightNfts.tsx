import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
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
  nfts: any[];
  selectedIndex: number | null;
  setOpen: any;
}) => {
  const { t } = useTranslation();
  if (!nfts.length) return null;
  return (
    <div>
      <GroupIdentifier name={t("collectibles")} />
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
            data: nft,
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

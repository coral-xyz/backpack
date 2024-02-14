import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { UserIcon } from "@coral-xyz/react-common";
import { useActiveWallet, useBlockchainConnectionUrl } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../refactor/navigation/WalletsNavigator";

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
  setOpen: _,
}: {
  nft: { name: string; image: string; id: string };
  selected: boolean;
  setOpen: any;
}) {
  const navigation = useNavigation<any>();

  return (
    <SpotlightCell
      selected={selected}
      onClick={() => {
        navigation.push(Routes.CollectiblesDetailScreen, {
          data: nft,
          title: nft.name,
        });
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

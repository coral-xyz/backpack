import { useEffect } from "react";
import { UI_RPC_METHOD_SETTINGS_SOLANA_COMPRESSED_NFTS_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, useCompressedNfts } from "@coral-xyz/recoil";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { ModeSwitch } from "..";

export const PreferencesSolana: React.FC = () => {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const isCompressedNftsEnabled = useCompressedNfts();

  const onCompressedNftsSwitch = async (isCompressedNftsEnabled: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_SOLANA_COMPRESSED_NFTS_UPDATE,
      params: [isCompressedNftsEnabled],
    });
  };

  const solanaMenuItems = {
    "RPC Connection": {
      onClick: () => nav.push("preferences-solana-rpc-connection"),
    },
    "Confirmation Commitment": {
      onClick: () => nav.push("preferences-solana-commitment"),
    },
    Explorer: {
      onClick: () => nav.push("preferences-solana-explorer"),
    },
    "Compressed NFTs": {
      onClick: () => onCompressedNftsSwitch(!isCompressedNftsEnabled),
      detail: (
        <ModeSwitch
          enabled={isCompressedNftsEnabled}
          onSwitch={(enabled) => onCompressedNftsSwitch(enabled)}
        />
      ),
    },
  };

  useEffect(() => {
    nav.setOptions({ headerTitle: "Solana" });
  }, [nav]);

  return <SettingsList menuItems={solanaMenuItems} />;
};

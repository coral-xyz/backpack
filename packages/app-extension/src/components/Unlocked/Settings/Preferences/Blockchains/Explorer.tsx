import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_EXPLORER_UPDATE } from "@coral-xyz/common";
import {
  blockchainConfigAtom,
  blockchainExplorer,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { Checkmark } from "./ConnectionSwitch";

export function PreferencesBlockchainExplorer({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const background = useBackgroundClient();
  const explorer = useRecoilValue(blockchainExplorer(blockchain))!;
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Explorer" });
  }, [nav]);

  const menuItems = Object.fromEntries(
    new Map(
      Object.entries(blockchainConfig.Explorers!).map(([name, { url }]) => [
        name,
        {
          onClick: () => changeExplorer(url),
          detail: explorer === url ? <Checkmark /> : <div />,
        },
      ])
    )
  );

  const changeExplorer = (explorer: string) => {
    try {
      // ph101pp todo
      background
        .request({
          method: UI_RPC_METHOD_EXPLORER_UPDATE,
          params: [explorer, blockchain],
        })
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  return <SettingsList menuItems={menuItems} />;
}

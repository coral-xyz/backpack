import { useEffect } from "react";
import { Blockchain } from "@coral-xyz/common";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { PreferencesBlockchains } from "../Blockchains";

export const PreferencesEthereum = () => {
  const nav = useNavStack();
  const ethereumMenuItems = {
    "RPC Connection": {
      onClick: () => nav.push("preferences-ethereum-rpc-connection"),
    },
  };

  useEffect(() => {
    nav.setTitle("Ethereum");
  }, [nav]);

  return (
    <div>
      <PreferencesBlockchains blockchain={Blockchain.ETHEREUM} />
      <SettingsList menuItems={ethereumMenuItems} />
    </div>
  );
};

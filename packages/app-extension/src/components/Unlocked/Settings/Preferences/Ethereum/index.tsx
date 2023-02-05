import { useEffect } from "react";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

export const PreferencesEthereum = () => {
  const nav = useNavigation();
  const ethereumMenuItems = {
    "RPC Connection": {
      onClick: () => nav.push("preferences-ethereum-rpc-connection"),
    },
  };

  useEffect(() => {
    nav.setTitle("Ethereum");
  }, [nav]);

  return <SettingsList menuItems={ethereumMenuItems} />;
};

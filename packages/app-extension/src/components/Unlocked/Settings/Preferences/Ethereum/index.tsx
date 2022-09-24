import { useEffect } from "react";
import { SettingsList } from "../../../../common/Settings/List";
import { useNavStack } from "../../../../common/Layout/NavStack";

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

  return <SettingsList menuItems={ethereumMenuItems} />;
};

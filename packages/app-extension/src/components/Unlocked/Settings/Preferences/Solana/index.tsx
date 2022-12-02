import { useEffect } from "react";
import { Blockchain } from "@coral-xyz/common";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { PreferencesBlockchains } from "../Blockchains";

export const PreferencesSolana: React.FC = () => {
  return (
    <div>
      <PreferencesBlockchains blockchain={Blockchain.SOLANA} />
      <_PreferencesSolana />
    </div>
  );
};

export const _PreferencesSolana: React.FC = () => {
  const nav = useNavStack();
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
  };

  useEffect(() => {
    nav.setTitle("Solana");
  }, [nav]);

  return <SettingsList menuItems={solanaMenuItems} />;
};

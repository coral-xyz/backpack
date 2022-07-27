import { useCustomTheme } from "@coral-xyz/themes";
import { SettingsList } from "../../common/Settings/List";
import { useNavStack } from "../../Layout/NavStack";

export function Preferences() {
  const nav = useNavStack();

  //
  // Global.
  //
  const menuItems = {
    "Auto-lock timer": {
      onClick: () => nav.push("preferences-auto-lock"),
    },
    "Trusted Apps": {
      onClick: () => nav.push("preferences-trusted-apps"),
    },
  };

  //
  // Solana.
  //
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

  return (
    <div>
      <SettingsList menuItems={menuItems} />
      <SettingsList menuItems={solanaMenuItems} />
    </div>
  );
}

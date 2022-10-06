import { useEffect } from "react";
import {
  Blockchain,
  toTitleCase,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
} from "@coral-xyz/common";
import {
  useAvailableBlockchains,
  useBackgroundClient,
  useEnabledBlockchains,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";
import { SecondaryButton, DangerButton } from "../../../common";

export function PreferencesBlockchains() {
  const nav = useNavStack();
  const availableBlockchains = useAvailableBlockchains();
  const enabledBlockchains = useEnabledBlockchains();

  useEffect(() => {
    nav.setTitle("Blockchains");
  }, [nav]);

  const menuItems = Object.fromEntries(
    availableBlockchains.map((blockchain: Blockchain) => {
      return [
        toTitleCase(blockchain),
        {
          onClick: () => {},
          detail: enabledBlockchains.includes(blockchain) ? (
            <DisableButton
              blockchain={blockchain}
              disabled={enabledBlockchains.length === 1}
            />
          ) : (
            <EnableButton blockchain={blockchain} />
          ),
        },
      ];
    })
  );

  return <SettingsList menuItems={menuItems} />;
}

function EnableButton({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();

  const onClick = async () => {
    await background.request({
      method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
      params: [blockchain],
    });
  };

  return (
    <SecondaryButton
      onClick={() => onClick()}
      label="Enable"
      style={{
        width: "71px",
        height: "34px",
        borderRadius: "4px",
      }}
    />
  );
}

function DisableButton({
  blockchain,
  disabled,
}: {
  blockchain: Blockchain;
  disabled: boolean;
}) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();

  const onClick = async () => {
    await background.request({
      method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
      params: [blockchain],
    });
  };

  return (
    <DangerButton
      onClick={() => onClick()}
      label="Disable"
      style={{
        backgroundColor: theme.custom.colors.negative,
        width: "71px",
        height: "34px",
        borderRadius: "4px",
      }}
      disabled={disabled}
    />
  );
}

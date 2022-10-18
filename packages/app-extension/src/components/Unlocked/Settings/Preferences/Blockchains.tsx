import { useState } from "react";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
} from "@coral-xyz/common";
import { useBackgroundClient, useEnabledBlockchains } from "@coral-xyz/recoil";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import { SwitchToggle } from ".";
import { SettingsList } from "../../../common/Settings/List";

export function PreferencesBlockchains({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const background = useBackgroundClient();
  const enabledBlockchains = useEnabledBlockchains();
  const isEnabled = enabledBlockchains.includes(blockchain);
  // Can only disable a blokchain if it's *not* the last one remaining.
  const isToggleDisabled = isEnabled && enabledBlockchains.length === 1;

  const _onClick = async (isDisabled: boolean) => {
    if (isToggleDisabled) {
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), 2000);
    } else {
      onToggle(isDisabled);
    }
  };

  const onToggle = async (isDisabled: boolean) => {
    if (isDisabled) {
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
        params: [blockchain],
      });
    } else {
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
        params: [blockchain],
      });
    }
  };

  const menuItems = {
    "Enable blockchain": {
      onClick: () => _onClick(isEnabled),
      detail: (
        <SwitchToggle
          disableUiState={isToggleDisabled}
          enabled={isEnabled}
          onChange={() => {}}
        />
      ),
    },
  };

  return (
    <div>
      <WithCopyTooltip
        tooltipOpen={tooltipOpen}
        title={"Can't toggle the last enabled network"}
      >
        <div>
          <SettingsList menuItems={menuItems} />
        </div>
      </WithCopyTooltip>
    </div>
  );
}

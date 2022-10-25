import { useState } from "react";
import {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEnabledBlockchains,
  useKeyringType,
} from "@coral-xyz/recoil";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import { SwitchToggle } from ".";
import { SettingsList } from "../../../common/Settings/List";
import { HardwareOnboard } from "../../../Onboarding/pages/HardwareOnboard";
import { WithDrawer } from "../../../common/Layout/Drawer";

export function PreferencesBlockchains({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const background = useBackgroundClient();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringType = useKeyringType();
  const isEnabled = enabledBlockchains.includes(blockchain);
  // Can only disable a blockchain if it's *not* the last one remaining.
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
      const blockchainKeyrings = await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });

      if (!blockchainKeyrings.includes(blockchain)) {
        // Blockchain has no keyring initialised, initialise it
        if (keyringType === "ledger") {
          setOpenDrawer(true);
        } else {
          // Mnemonic based keyring. This is the simple case because we don't
          // need to prompt for the user to open their Ledger app to get the
          // required public key.
          await background.request({
            method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
            params: [blockchain, DerivationPath.Default, 0, undefined],
          });
        }
      } else {
        // Keyring exists for blockchain, just enable it
        await background.request({
          method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
          params: [blockchain],
        });
      }
    }
  };

  const handleHardwareOnboardComplete = async (
    result: BlockchainKeyringInit
  ) => {
    await background.request({
      method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
      params: [
        result.blockchain,
        result.derivationPath,
        result.accountIndex,
        result.publicKey,
      ],
    });
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
    <>
      <WithCopyTooltip
        tooltipOpen={tooltipOpen}
        title={"Can't toggle the last enabled network"}
      >
        <div>
          <SettingsList menuItems={menuItems} />
        </div>
      </WithCopyTooltip>
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        paperStyles={{
          height: "calc(100% - 56px)",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <HardwareOnboard
          blockchain={blockchain!}
          action={"create"}
          onComplete={handleHardwareOnboardComplete}
          onClose={() => setOpenDrawer(false)}
          requireSignature={false}
        />
      </WithDrawer>
    </>
  );
}

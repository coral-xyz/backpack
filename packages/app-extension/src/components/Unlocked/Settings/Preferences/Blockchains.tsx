import { useState } from "react";
import type { Blockchain, BlockchainKeyringInit } from "@coral-xyz/common";
import {
  DerivationPath,
  getAddMessage,
  toTitleCase,
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
import { Typography } from "@mui/material";

import { WithDrawer } from "../../../common/Layout/Drawer";
import { SettingsList } from "../../../common/Settings/List";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import { HardwareOnboard } from "../../../Onboarding/pages/HardwareOnboard";

import { SwitchToggle } from ".";

export function PreferencesBlockchains({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Disable the blockchain
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
        params: [blockchain],
      });
    } else {
      // Get all the keyrings for the blockchain and see if we already have one
      // for the blockchain being enabled
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
          // required public key. We also don't need a signature to prove
          // ownership of the public key because that can't be done
          // transparently by the backend.
          try {
            await background.request({
              method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
              params: [blockchain, DerivationPath.Default, 0],
            });
          } catch (error) {
            setError("Wallet address is used by another Backpack account.");
          }
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
    try {
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
        params: [
          result.blockchain,
          result.derivationPath,
          result.accountIndex,
          result.publicKey,
          result.signature,
        ],
      });
    } catch (error) {
      setError("Wallet address is used by another Backpack account.");
    }
    setOpenDrawer(false);
  };

  const menuItems = {
    "Enable Blockchain": {
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
          {error && (
            <Typography style={{ color: "red", margin: "12px 24px" }}>
              {error}
            </Typography>
          )}
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
          signMessage={getAddMessage}
          signText={`Sign the message to enable the ${toTitleCase(
            blockchain!
          )} in Backpack.`}
          onComplete={handleHardwareOnboardComplete}
          onClose={() => setOpenDrawer(false)}
        />
      </WithDrawer>
    </>
  );
}

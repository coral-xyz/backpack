import { useEffect } from "react";
import { Blockchain } from "@coral-xyz/common";
import {
  blockchainConfigAtom,
  secureUserAtom,
  userClientAtom,
} from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { ModeSwitch } from "..";

export const PreferencesBlockchain: React.FC<{ blockchain: Blockchain }> = ({
  blockchain,
}) => {
  const nav = useNavigation();
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);

  const onImpersonateMetamaskSwitch = async (
    doNotImpersonateMetaMask: boolean
  ) => {
    await userClient.updateUserPreferences({
      uuid: user.user.uuid,
      preferences: {
        doNotImpersonateMetaMask,
      },
    });
  };

  const menuItems: any = {
    "RPC Connection": {
      onClick: () =>
        nav.push("preferences-blockchain-rpc-connection", { blockchain }),
    },
  };
  if (blockchainConfig.ConfirmationCommitments) {
    menuItems["Confirmation Commitment"] = {
      onClick: () =>
        nav.push("preferences-blockchain-commitment", { blockchain }),
    };
  }
  if (blockchainConfig.Explorers) {
    menuItems["Explorer"] = {
      onClick: () =>
        nav.push("preferences-blockchain-explorer", { blockchain }),
    };
  }
  if (blockchain === Blockchain.ETHEREUM) {
    menuItems["Simulate MetaMask"] = {
      onClick: () =>
        onImpersonateMetamaskSwitch(!user.preferences.doNotImpersonateMetaMask),
      detail: (
        <ModeSwitch
          enabled={!user.preferences.doNotImpersonateMetaMask}
          onSwitch={(enabled) => onImpersonateMetamaskSwitch(!enabled)}
        />
      ),
    };
  }

  useEffect(() => {
    nav.setOptions({ headerTitle: blockchainConfig.Name });
  }, [nav]);

  return <SettingsList menuItems={menuItems} />;
};

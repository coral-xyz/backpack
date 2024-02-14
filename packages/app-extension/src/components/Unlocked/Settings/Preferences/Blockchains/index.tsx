import { Blockchain } from "@coral-xyz/common";
import {
  blockchainConfigAtom,
  secureUserAtom,
  userClientAtom,
} from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";
import { SettingsList } from "../../../../common/Settings/List";
import { ModeSwitch } from "..";

export const PreferencesBlockchain: React.FC<{ blockchain: Blockchain }> = ({
  blockchain,
}) => {
  const navigation = useNavigation<any>();
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
        navigation.push(Routes.PreferencesBlockchainRpcConnectionScreen, {
          blockchain,
        }),
    },
  };
  if (blockchainConfig.ConfirmationCommitments) {
    menuItems["Confirmation Commitment"] = {
      onClick: () =>
        navigation.push(Routes.PreferencesBlockchainCommitmentScreen, {
          blockchain,
        }),
    };
  }
  if (blockchainConfig.Explorers) {
    menuItems["Explorer"] = {
      onClick: () =>
        navigation.push(Routes.PreferencesBlockchainExplorerScreen, {
          blockchain,
        }),
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

  return <SettingsList menuItems={menuItems} />;
};

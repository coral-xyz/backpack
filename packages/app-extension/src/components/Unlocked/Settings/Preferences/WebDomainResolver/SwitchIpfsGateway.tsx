import {
  DEFAULT_IPFS_GATEWAYS,
  UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { PushDetail } from "@coral-xyz/react-common";
import { useBackgroundClient, useIpfsGateway } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

import { setIPFSGateway } from "../../../../../dns-redirects/helpers";
import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";
import { SettingsList } from "../../../../common/Settings/List";
import { Checkmark } from "../Blockchains/ConnectionSwitch";

interface MenuItems {
  [key: string]: {
    onClick: () => void;
    detail?: React.ReactNode;
    style?: React.CSSProperties;
    classes?: any;
    button?: boolean;
    icon?: React.ReactNode;
    label?: string;
  };
}
export function PreferencesIpfsGateway() {
  const background = useBackgroundClient();
  const { t } = useTranslation();

  const navigation = useNavigation<any>();

  const currentIpfsGatewayUrl = useIpfsGateway();
  const changeIpfsGateway = async (url: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE,
          params: [url],
        })
        .catch(console.error);
      await setIPFSGateway(url);
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = DEFAULT_IPFS_GATEWAYS.reduce((acc, gateway) => {
    (acc as MenuItems)[gateway] = {
      onClick: () => changeIpfsGateway(gateway),
      detail: currentIpfsGatewayUrl === gateway && <Checkmark />,
    };
    return acc;
  }, {});
  const customMenu: MenuItems = {
    [t("custom")]: {
      onClick: () =>
        navigation.push(
          Routes.PreferencesWebDomainResolverIpfsGatewayCustomScreen
        ),
      detail: !DEFAULT_IPFS_GATEWAYS.includes(currentIpfsGatewayUrl) ? (
        <>
          <Checkmark />
          <PushDetail />
        </>
      ) : (
        <PushDetail />
      ),
    },
  };
  Object.assign(menuItems, customMenu);

  return <SettingsList menuItems={menuItems} />;
}

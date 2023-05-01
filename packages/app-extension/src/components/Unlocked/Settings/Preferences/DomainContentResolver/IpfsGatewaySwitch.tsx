import { useEffect } from "react";
import {
  DEFAULT_IPFS_GATEWAYS,
  UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE,
} from "@coral-xyz/common";
import { PushDetail } from "@coral-xyz/react-common";
import { useBackgroundClient, useIpfsGateway } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Check } from "@mui/icons-material";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

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
import { setIPFSGateway } from "@coral-xyz/app-extension/src/redirects/ipfsBuilder";
export function PreferencesIpfsGateway() {
  const nav = useNavigation();
  const background = useBackgroundClient();

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

  useEffect(() => {
    nav.setOptions({ headerTitle: "IPFS Gateway" });
  }, [nav]);

  const menuItems = DEFAULT_IPFS_GATEWAYS.reduce((acc, gateway) => {
    (acc as MenuItems)[gateway] = {
      onClick: () => changeIpfsGateway(gateway),
      detail: currentIpfsGatewayUrl === gateway && <Checkmark />,
    };
    return acc;
  }, {});
  const customMenu: MenuItems = {
    Custom: {
      onClick: () => {
        nav.push("preferences-edit-ipfs-gateway-custom");
      },
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

export function Checkmark() {
  const theme = useCustomTheme();
  return (
    <Check
      style={{
        color: theme.custom.colors.brandColor,
      }}
    />
  );
}

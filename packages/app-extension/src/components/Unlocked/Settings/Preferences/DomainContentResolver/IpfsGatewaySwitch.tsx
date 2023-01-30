import { useEffect } from "react";
import { UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE } from "@coral-xyz/common";
import { PushDetail } from "@coral-xyz/react-common";
import { useBackgroundClient, useIpfsGateway } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Check } from "@mui/icons-material";

import { IPFSGateways } from "../../../../../redirects/constants";
import { useNavStack } from "../../../../common/Layout/NavStack";
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
  const nav = useNavStack();
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
    nav.setTitle("IPFS Gateway");
  }, [nav]);

  const menuItems = IPFSGateways.reduce((acc, gateway) => {
    (acc as MenuItems)[gateway] = {
      onClick: () => changeIpfsGateway(gateway),
      detail: currentIpfsGatewayUrl === gateway ? <Checkmark /> : <></>,
    };
    return acc;
  }, {});
  const customMenu: MenuItems = {
    Custom: {
      onClick: () => {
        nav.push("preferences-edit-ipfs-gateway-custom");
      },
      detail: !IPFSGateways.includes(currentIpfsGatewayUrl) ? (
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

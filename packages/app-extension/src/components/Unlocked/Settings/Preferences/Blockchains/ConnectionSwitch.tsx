import type { Blockchain, ChannelAppUiClient } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
} from "@coral-xyz/common";
import { PushDetail } from "@coral-xyz/react-common";
import {
  blockchainConfigAtom,
  blockchainConnectionUrl,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { Check } from "@mui/icons-material";
import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import { useRecoilValue } from "recoil";

import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";
import { SettingsList } from "../../../../common/Settings/List";

const { hexlify } = ethers.utils;

export function PreferencesBlockchainConnection({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const background = useBackgroundClient();
  const currentUrl = useRecoilValue(blockchainConnectionUrl(blockchain));
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  const navigation = useNavigation<any>();

  const menuItems = Object.fromEntries(
    new Map(
      Object.entries(blockchainConfig!.RpcConnectionUrls).map(
        ([, { name, url, chainId }]) => [
          name,
          {
            onClick: () => {
              changeNetwork(background, blockchain, url, chainId);
            },
            detail: currentUrl === url ? <Checkmark /> : null,
          },
        ]
      )
    )
  );

  menuItems["Custom"] = {
    onClick: () =>
      navigation.push(Routes.PreferencesBlockchainRpcConnectionCustomScreen, {
        blockchain,
      }),
    detail:
      Object.values(blockchainConfig!.RpcConnectionUrls)
        .map(({ url }) => url)
        .find((url) => url === currentUrl) === undefined ? (
          <>
            <Checkmark />
            <PushDetail />
          </>
      ) : (
        <PushDetail />
      ),
  };

  return <SettingsList menuItems={menuItems} />;
}

export function Checkmark() {
  const theme = useTheme();
  return (
    <Check
      style={{
        color: theme.accentBlue.val,
      }}
    />
  );
}

export const changeNetwork = async (
  background: ChannelAppUiClient,
  blockchain: Blockchain,
  url: string,
  chainId?: string
) => {
  try {
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
      params: [url, blockchain],
    });

    // TODO: this probably shouldn't assume ethers?
    if (chainId === "fetchMe") {
      const provider = ethers.getDefaultProvider(url);
      const network = await provider.getNetwork();
      chainId = hexlify(network.chainId);
    }
    if (chainId) {
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
        params: [chainId],
      });
    }
  } catch (err) {
    console.error(err);
  }
};

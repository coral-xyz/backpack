import {
  Blockchain,
  UI_RPC_METHOD_SETTINGS_DOMAIN_RESOLUTION_NETWORKS_UPDATE,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  getBlockchainLogo,
  useBackgroundClient,
  useSupportedDnsNetwork,
} from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

import { toggleSupportedNetworkResolution } from "../../../../../dns-redirects/helpers";
import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";
import { SettingsList } from "../../../../common/Settings/List";
import { ModeSwitch } from "..";

export const PreferencesDomainResolverContent: React.FC = () => {
  const { t } = useTranslation();

  const navigation = useNavigation<any>();
  const resolverMenuItems = {
    [t("ipfs_gateways")]: {
      onClick: () =>
        navigation.push(Routes.PreferencesWebDomainResolverIpfsGatewayScreen),
    },
  };

  const background = useBackgroundClient();

  const isSupportedNetwork = {
    [Blockchain.SOLANA]: useSupportedDnsNetwork(Blockchain.SOLANA),
    [Blockchain.ETHEREUM]: useSupportedDnsNetwork(Blockchain.ETHEREUM),
  };

  const toggleSupportedDNSResolutionNetworks = async (
    blockchain: Blockchain,
    isEnabled: boolean
  ) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SETTINGS_DOMAIN_RESOLUTION_NETWORKS_UPDATE,
          params: [blockchain, isEnabled],
        })
        .catch(console.error);
      await toggleSupportedNetworkResolution(blockchain, isEnabled);
    } catch (err) {
      console.error(err);
    }
  };

  const blockchainMenuItems: any = {
    Solana: {
      onClick: async () => {
        await toggleSupportedDNSResolutionNetworks(
          Blockchain.SOLANA,
          !isSupportedNetwork[Blockchain.SOLANA]
        );
      },
      icon: () => {
        const blockchainLogo = getBlockchainLogo(Blockchain.SOLANA);
        return (
          <img
            src={blockchainLogo}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "8px",
            }}
          />
        );
      },
      detail: (
        <ModeSwitch
          enabled={isSupportedNetwork[Blockchain.SOLANA]}
          onSwitch={(enabled) =>
            toggleSupportedDNSResolutionNetworks(Blockchain.SOLANA, enabled)
          }
        />
      ),
    },
    Ethereum: {
      onClick: async () => {
        await toggleSupportedDNSResolutionNetworks(
          Blockchain.ETHEREUM,
          !isSupportedNetwork[Blockchain.ETHEREUM]
        );
      },
      icon: () => {
        const blockchainLogo = getBlockchainLogo(Blockchain.ETHEREUM);
        return (
          <img
            src={blockchainLogo}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "8px",
            }}
          />
        );
      },
      detail: (
        <ModeSwitch
          enabled={isSupportedNetwork[Blockchain.ETHEREUM]}
          onSwitch={(enabled) =>
            toggleSupportedDNSResolutionNetworks(Blockchain.ETHEREUM, enabled)
          }
        />
      ),
    },
  };

  return (
    <div>
      <SettingsList menuItems={resolverMenuItems} />
      <SettingsList menuItems={blockchainMenuItems as any} />
    </div>
  );
};

import { useEffect } from "react";
import {
  Blockchain,
  UI_RPC_METHOD_SETTINGS_DOMAIN_RESOLUTION_NETWORKS_UPDATE,
} from "@coral-xyz/common";
import {
  getBlockchainLogo,
  useBackgroundClient,
  useSupportedDomainNameNetwork,
} from "@coral-xyz/recoil";

import { toggleSupportedNetworkResolution } from "../../../../../redirects/ipfsBuilder";
import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
import { ModeSwitch } from "..";
export const PreferencesDomainContent: React.FC = () => {
  return (
    <div>
      <_PreferencesDomainResolverContent />
    </div>
  );
};

export const _PreferencesDomainResolverContent: React.FC = () => {
  const nav = useNavigation();
  const resolverMenuItems = {
    "IPFS Gateways": {
      onClick: () => nav.push("preferences-ipfs-gateway"),
    },
  };

  useEffect(() => {
    nav.setOptions({ headerTitle: "Domain Website Resolver" });
  }, [nav]);

  const background = useBackgroundClient();

  const isEnabledSolana = useSupportedDomainNameNetwork(Blockchain.SOLANA);
  const isEnabledEthereum = useSupportedDomainNameNetwork(Blockchain.ETHEREUM);

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
          !isEnabledSolana
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
          enabled={isEnabledSolana}
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
          !isEnabledEthereum
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
          enabled={isEnabledEthereum}
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

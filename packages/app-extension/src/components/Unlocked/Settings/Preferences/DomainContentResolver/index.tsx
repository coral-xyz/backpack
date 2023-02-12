import { useEffect } from "react";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
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

  return <SettingsList menuItems={resolverMenuItems} />;
};

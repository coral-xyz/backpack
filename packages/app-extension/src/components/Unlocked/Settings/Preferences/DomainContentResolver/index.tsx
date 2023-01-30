import { useEffect } from "react";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";
export const PreferencesDomainContent: React.FC = () => {
  return (
    <div>
      <_PreferencesDomainResolverContent />
    </div>
  );
};

export const _PreferencesDomainResolverContent: React.FC = () => {
  const nav = useNavStack();
  const resolverMenuItems = {
    "IPFS Gateways": {
      onClick: () => nav.push("preferences-ipfs-gateway"),
    },
  };
  useEffect(() => {
    nav.setTitle("Domain Content Resolver");
  }, [nav]);

  return <SettingsList menuItems={resolverMenuItems} />;
};

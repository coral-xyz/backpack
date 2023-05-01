import { useEffect, useState } from "react";
import { setIPFSGateway } from "@coral-xyz/app-extension/src/redirects/ipfsBuilder";
import { UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE } from "@coral-xyz/common";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { useNavigation } from "../../../../common/Layout/NavStack";

export function PreferencesCustomIpfsGateway() {
  const nav = useNavigation();
  const background = useBackgroundClient();

  const [gatewayUrl, setGatewayUrl] = useState("");
  const changeIpfsGateway = async () => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE,
          params: [gatewayUrl],
        })
        .catch(console.error);

      await setIPFSGateway(gatewayUrl);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const title = nav.title;
    nav.setOptions({ headerTitle: "Change IPFS Gateway" });
    return () => {
      nav.setOptions({ headerTitle: title });
    };
  }, [nav]);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <form
        onSubmit={changeIpfsGateway}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <Inputs error={false}>
            <InputListItem
              isFirst
              isLast
              button={false}
              title="Gateway"
              placeholder="Gateway URL"
              value={gatewayUrl}
              onChange={(e) => {
                setGatewayUrl(e.target.value);
              }}
            />
          </Inputs>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton disabled={!gatewayUrl} label="Switch" type="submit" />
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { UI_RPC_METHOD_SETTINGS_DOMAIN_CONTENT_IPFS_GATEWAY_UPDATE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { setIPFSGateway } from "../../../../../dns-redirects/helpers";

export function PreferencesCustomIpfsGateway() {
  const background = useBackgroundClient();
  const { t } = useTranslation();

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
              title={t("gateway")}
              placeholder={t("gateway_url")}
              value={gatewayUrl}
              onChange={(e) => {
                setGatewayUrl(e.target.value);
              }}
            />
          </Inputs>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton
            disabled={!gatewayUrl}
            label={t("switch")}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

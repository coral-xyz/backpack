import { useEffect, useState } from "react";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { PrimaryButton } from "../../../../common";
import { InputListItem, Inputs } from "../../../../common/Inputs";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavStack } from "../../../../common/Layout/NavStack";

export function PreferenceSolanaCustomRpcUrl() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [connectionUrl, setConnectionUrl] = useState("");

  const [connectionUrlError, setConnectionUrlError] = useState(false);

  const changeNetwork = () => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
          params: [Blockchain.SOLANA, { connectionUrl }],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Change RPC Connection");
    return () => {
      nav.setTitle(title);
    };
  }, []);

  useEffect(() => {
    if (!connectionUrl) {
      setConnectionUrlError(false);
      return;
    }
    try {
      new URL(connectionUrl.trim());
      setConnectionUrlError(false);
    } catch (e: any) {
      setConnectionUrlError(true);
    }
  }, [connectionUrl]);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <form
        onSubmit={changeNetwork}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <Inputs error={connectionUrlError}>
            <InputListItem
              isFirst={true}
              isLast={true}
              button={false}
              title={"RPC"}
              placeholder={"RPC URL"}
              value={connectionUrl}
              onChange={(e) => {
                setConnectionUrl(e.target.value);
              }}
            />
          </Inputs>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton
            disabled={!connectionUrl || connectionUrlError}
            label="Switch"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

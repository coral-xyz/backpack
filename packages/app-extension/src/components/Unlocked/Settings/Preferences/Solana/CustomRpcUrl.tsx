import { useEffect, useState } from "react";
import { UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE } from "@coral-xyz/common";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavigation } from "../../../../common/Layout/NavStack";

export function PreferenceSolanaCustomRpcUrl() {
  const { close } = useDrawerContext();
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [rpcUrl, setRpcUrl] = useState("");

  const [rpcUrlError, setRpcUrlError] = useState(false);

  const changeNetwork = () => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
          params: [rpcUrl],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const title = nav.title;
    nav.setOptions({ headerTitle: "Change RPC Connection" });
    return () => {
      nav.setOptions({ headerTitle: title });
    };
  }, []);

  useEffect(() => {
    if (!rpcUrl) {
      setRpcUrlError(false);
      return;
    }
    try {
      new URL(rpcUrl.trim());
      setRpcUrlError(false);
    } catch (e: any) {
      setRpcUrlError(true);
    }
  }, [rpcUrl]);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <form
        onSubmit={changeNetwork}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <Inputs error={rpcUrlError}>
            <InputListItem
              isFirst
              isLast
              button={false}
              title="RPC"
              placeholder="RPC URL"
              value={rpcUrl}
              onChange={(e) => {
                setRpcUrl(e.target.value);
              }}
            />
          </Inputs>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton
            disabled={!rpcUrl || rpcUrlError}
            label="Switch"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

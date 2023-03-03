import { useEffect, useState } from "react";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavigation } from "../../../../common/Layout/NavStack";

import { changeNetwork } from "./common";

export function PreferenceEthereumCustomRpcUrl() {
  const { close } = useDrawerContext();
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [rpcUrl, setRpcUrl] = useState("");
  const [chainId, setChainId] = useState("");

  const [rpcUrlError, setRpcUrlError] = useState(false);

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
        onSubmit={async () => {
          await changeNetwork(background, rpcUrl, chainId);
          close();
        }}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <Inputs error={rpcUrlError}>
            <InputListItem
              isLast={false}
              isFirst
              button={false}
              title="RPC"
              placeholder="RPC URL"
              value={rpcUrl}
              onChange={(e) => {
                setRpcUrl(e.target.value);
              }}
            />
            <InputListItem
              isLast
              isFirst={false}
              button={false}
              title="Chain"
              placeholder="Chain ID"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
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

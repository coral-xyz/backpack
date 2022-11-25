import { useEffect, useState } from "react";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { PrimaryButton } from "../../../../common";
import { InputListItem, Inputs } from "../../../../common/Inputs";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavStack } from "../../../../common/Layout/NavStack";

import { changeNetwork } from "./common";

export function PreferenceEthereumCustomRpcUrl() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [rpcUrl, setRpcUrl] = useState("");
  const [chainId, setChainId] = useState("");

  const [rpcUrlError, setRpcUrlError] = useState(false);

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Change RPC Connection");
    return () => {
      nav.setTitle(title);
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
              isFirst={true}
              button={false}
              title={"RPC"}
              placeholder={"RPC URL"}
              value={rpcUrl}
              onChange={(e) => {
                setRpcUrl(e.target.value);
              }}
            />
            <InputListItem
              isLast={true}
              isFirst={false}
              button={false}
              title={"Chain"}
              placeholder={"Chain ID"}
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

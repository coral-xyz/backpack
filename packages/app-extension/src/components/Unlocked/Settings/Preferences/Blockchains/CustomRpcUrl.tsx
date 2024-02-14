import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import {
  blockchainConfigAtom,
  secureUserAtom,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { changeNetwork } from "./ConnectionSwitch";

export function PreferenceBlockchainCustomRpcUrl({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const background = useBackgroundClient();
  const user = useRecoilValue(secureUserAtom);
  const currentURL = user.preferences.blockchains[blockchain]?.connectionUrl;
  const currentChainId =
    user.preferences.blockchains[blockchain]?.chainId ?? "";
  const [rpcUrl, setRpcUrl] = useState(currentURL);
  const [chainId, setChainId] = useState(currentChainId);
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  const requiresChainId = blockchainConfig.requiresChainId;

  const [rpcUrlError, setRpcUrlError] = useState(false);

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
        onSubmit={() =>
          changeNetwork(
            background,
            blockchain,
            rpcUrl,
            requiresChainId ? chainId : undefined
          )
        }
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
            {requiresChainId ? (
              <InputListItem
                isLast
                isFirst={false}
                button={false}
                title="Chain"
                placeholder="Chain ID"
                value={chainId}
                onChange={(e) => setChainId(e.target.value)}
              />
            ) : null}
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

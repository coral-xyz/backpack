import { explorerResolverForBlockchain } from "@coral-xyz/blockchain-common";
import type { Blockchain } from "@coral-xyz/common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { Loading, SecondaryButton } from "../../common";

export function Sending({
  blockchain,
  signature,
}: {
  blockchain: Blockchain;
  signature: string;
}) {
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(blockchain);
  const explorerUrl = explorerResolverForBlockchain(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  return (
    <div
      style={{
        height: "184px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        style={{
          textAlign: "center",
          color: theme.custom.colors.secondary,
          fontSize: "16px",
          fontWeight: 500,
          marginTop: "20px",
        }}
      >
        Sending
      </Typography>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Loading
          size={48}
          iconStyle={{
            color: theme.custom.colors.primaryButton,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          thickness={6}
        />
      </div>
      <div
        style={{
          marginBottom: "16px",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        {explorer && connectionUrl && (
          <SecondaryButton
            onClick={() => {
              window.open(explorerUrl(explorer, signature, connectionUrl));
            }}
            label={"View Explorer"}
          />
        )}
      </div>
    </div>
  );
}

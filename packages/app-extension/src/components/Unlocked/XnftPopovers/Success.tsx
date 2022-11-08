import { Blockchain, explorerUrl } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { Typography } from "@mui/material";
import { TokenAmountHeader } from "../../common/TokenAmountHeader";
import { CheckIcon } from "../../common/Icon";
import { SecondaryButton } from "../../common";

export function Success({
  blockchain,
  signature,
  title,
}: {
  blockchain: Blockchain;
  signature: string;
  title?: string;
}) {
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(blockchain);
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
        {title ? title : "Sent"}
      </Typography>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <CheckIcon />
        </div>
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

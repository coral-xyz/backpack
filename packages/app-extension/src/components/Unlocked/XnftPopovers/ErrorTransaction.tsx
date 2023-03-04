import type { Blockchain } from "@coral-xyz/common";
import { explorerUrl } from "@coral-xyz/common";
import {
  CrossIcon,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

export function ErrorTransaction({
  blockchain,
  signature,
  onRetry,
}: {
  blockchain: Blockchain;
  signature: string;
  onRetry: () => void;
}) {
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const theme = useCustomTheme();

  return (
    <div
      style={{
        height: "254px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: "14px",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <Typography
          style={{
            fontSize: "16px",
            fontWeight: 500,
            marginTop: "20px",
            marginBottom: "16px",
            color: theme.custom.colors.fontColor,
          }}
        >
          Error while sending transaction
        </Typography>
        <div
          style={{
            height: "48px",
            marginBottom: 10,
          }}
        >
          <CrossIcon />
        </div>
        {explorer && connectionUrl && signature ? <SecondaryButton
          buttonLabelStyle={{
              fontSize: "14px",
            }}
          label="View Explorer"
          onClick={() =>
              window.open(
                explorerUrl(explorer, signature, connectionUrl),
                "_blank"
              )
            }
          /> : null}
      </div>
      <PrimaryButton label="Retry" onClick={() => onRetry()} />
    </div>
  );
}

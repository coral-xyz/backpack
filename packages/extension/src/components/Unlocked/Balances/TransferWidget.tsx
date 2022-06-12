import { useTheme, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { WithHeaderButton } from "./TokensWidget/Token";
import { Deposit } from "./TokensWidget/Deposit";

export function TransferWidget() {
  return (
    <div
      style={{
        display: "flex",
        width: "136px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      <ReceiveButton />
      <div style={{ width: "27px" }} />
      <SendButton />
    </div>
  );
}

function SendButton() {
  return (
    <TransferButton
      label={"Send"}
      labelComponent={
        <ArrowUpward
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      dialogTitle={"Send"}
    />
  );
}

function ReceiveButton() {
  return (
    <TransferButton
      label={"Receive"}
      labelComponent={
        <ArrowDownward
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      dialogTitle={"Deposit"}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  dialogTitle,
}: {
  label: string;
  labelComponent: any;
  dialogTitle: string;
}) {
  const theme = useTheme() as any;
  return (
    <div
      style={{
        width: "52px",
        height: "70px",
      }}
    >
      <WithHeaderButton
        style={{
          padding: 0,
          width: "42px",
          height: "42px",
          minWidth: "42px",
          borderRadius: "21px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          marginBottom: "8px",
        }}
        dialogTitle={dialogTitle}
        label={""}
        dialog={(setOpenDrawer: (b: boolean) => void) => {
          return <Deposit close={() => setOpenDrawer(false)} />;
        }}
        labelComponent={labelComponent}
      />
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </div>
  );
}

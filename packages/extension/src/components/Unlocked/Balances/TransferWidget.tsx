import { useState } from "react";
import { useTheme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { TextField } from "@200ms/anchor-ui-renderer";
import { WithHeaderButton } from "./TokensWidget/Token";
import { Deposit } from "./TokensWidget/Deposit";
import { TokenTable } from "./TokensWidget/TokenTable";

const useStyles = makeStyles((theme: any) => ({
  searchField: {
    marginTop: "16px",
    marginBottom: "16px",
    "& .MuiOutlinedInput-root": {
      height: "48px !important",
    },
  },
}));

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
      dialog={(setOpenDrawer: (b: boolean) => void) => {
        return <Send />;
      }}
      dialogTitle={"Select token"}
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
      dialog={(setOpenDrawer: (b: boolean) => void) => {
        return <Deposit close={() => setOpenDrawer(false)} />;
      }}
      dialogTitle={"Deposit"}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  dialog,
  dialogTitle,
}: {
  label: string;
  labelComponent: any;
  dialog: (setOpenDrawer: (b: boolean) => void) => React.ReactNode;
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
        dialog={dialog}
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

function Send() {
  const classes = useStyles();
  const [value, setValue] = useState("");
  return (
    <div>
      <TextField
        placeholder={"Search"}
        value={value}
        setValue={setValue}
        rootClass={classes.searchField}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <TokenTable />
    </div>
  );
}

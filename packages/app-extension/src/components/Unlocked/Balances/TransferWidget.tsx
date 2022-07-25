import { Blockchain } from "@coral-xyz/common";
import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { WithHeaderButton } from "./TokensWidget/Token";
import { Deposit } from "./TokensWidget/Deposit";
import { Send } from "./TokensWidget/Send";
import { useNavStack } from "../../Layout/NavStack";
import type { Token } from "../../common/TokenTable";
import { SearchableTokenTable } from "../../common/TokenTable";

export function TransferWidget() {
  return (
    <div
      style={{
        display: "flex",
        width: "120px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      <ReceiveButton />
      <div style={{ width: "16px" }} />
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
      routes={[
        {
          name: "select-token",
          component: SendToken,
          title: "Select token",
        },
        {
          name: "send",
          component: (props: any) => <_Send {...props} />,
          title: "",
        },
      ]}
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
      routes={[
        {
          component: Deposit,
          title: "Deposit",
          name: "deposit",
        },
      ]}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  routes,
}: {
  label: string;
  labelComponent: any;
  routes: Array<{ props?: any; component: any; title: string; name: string }>;
}) {
  const theme = useCustomTheme();
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
          boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          marginBottom: "8px",
        }}
        label={""}
        labelComponent={labelComponent}
        routes={routes}
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

function SendToken() {
  const { push } = useNavStack();

  const onClickRow = (blockchain: Blockchain, token: Token) => {
    push("send", { blockchain, token });
  };

  return (
    <SearchableTokenTable
      onClickRow={onClickRow}
      customFilter={(token: Token) => token.nativeBalance !== 0}
    />
  );
}

function _Send({
  token,
  blockchain,
}: {
  token: Token;
  blockchain: Blockchain;
}) {
  const { title, setTitle } = useNavStack();
  useEffect(() => {
    const prev = title;
    setTitle(`Send ${token.ticker}`);
    return () => {
      setTitle(prev);
    };
  }, []);
  return <Send blockchain={blockchain} tokenAddress={token.address} />;
}

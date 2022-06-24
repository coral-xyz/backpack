import { useState } from "react";
import { Card } from "@mui/material";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { CreateNewWallet } from "./CreateNewWallet";
import { ImportWallet } from "./ImportWallet";
import { PrimaryButton } from "../common";
import { BackpackHeader } from "../Locked";

const useStyles = styles((theme) => ({
  card: {
    width: "375px",
    height: "600px",
    background: theme.custom.colors.background,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
  },
  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column-reverse",
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
}));

export function Onboarding() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <ContentCard />
    </div>
  );
}

function ContentCard() {
  const classes = useStyles();
  const [content, setContent] = useState("welcome");
  return (
    <Card className={classes.card}>
      {content === "welcome" ? (
        <Welcome didSelectContent={setContent} />
      ) : content === "create-new-wallet" ? (
        <CreateNewWallet />
      ) : (
        <ImportWallet />
      )}
    </Card>
  );
}

function Welcome({
  didSelectContent,
}: {
  didSelectContent: (content: string) => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.nav,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <BackpackHeader />
      <div className={classes.content}>
        <div>
          <PrimaryButton
            onClick={() => didSelectContent("create-new-wallet")}
            label={"Create New Wallet"}
          />
          <PrimaryButton
            style={{
              marginTop: "10px",
              backgroundColor: theme.custom.colors.nav,
            }}
            buttonLabelStyle={{
              color: theme.custom.colors.fontColor,
            }}
            onClick={() => didSelectContent("import-wallet")}
            label={"Import Wallet"}
          />
        </div>
      </div>
    </div>
  );
}

export function Logo() {
  const classes = useStyles();
  const URL = "anchor.png";
  return (
    <div className={classes.logoContainer}>
      <img
        src={URL}
        style={{
          width: "175px",
          height: "175px",
          borderRadius: "100px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

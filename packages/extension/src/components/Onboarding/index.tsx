import { useState } from "react";
import { makeStyles, useTheme, Card } from "@material-ui/core";
import { CreateNewWallet } from "./CreateNewWallet";
import { ImportWallet } from "./ImportWallet";
import { OnboardButton } from "../common";

const useStyles = makeStyles((theme: any) => ({
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
  const theme = useTheme() as any;
  return (
    <div className={classes.content}>
      <div>
        <OnboardButton
          onClick={() => didSelectContent("create-new-wallet")}
          label={"Create New Wallet"}
        />
        <OnboardButton
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
      <Logo />
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

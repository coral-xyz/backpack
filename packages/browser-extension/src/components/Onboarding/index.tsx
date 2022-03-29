import { useState } from "react";
import { makeStyles, useTheme, Card } from "@material-ui/core";
import { CreateNewWallet } from "./CreateNewWallet";
import { ImportWallet } from "./ImportWallet";
import { OnboardButton } from "../common";

const useStyles = makeStyles((theme: any) => ({
  logo: {
    width: "150px",
    height: "150px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  button: {
    width: "100%",
    height: "48px",
  },
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
  buttonContainer: {},
  header: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
  },
  headerButton: {
    borderRadius: "20px",
    padding: "10px",
    display: "flex",
  },
  headerLabel: {
    display: "flex",
    background: theme.custom.colors.background,
    color: theme.custom.colors.fontColor,
    borderRadius: "20px",
    padding: "10px",
  },
  headerLogoContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  headerLogo: {
    width: "20px",
    height: "20px",
    marginRight: "8px",
  },
  logoContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  helpIcon: {
    marginRight: "8px",
    color: theme.custom.colors.background,
  },
  helpText: {
    color: theme.custom.colors.background,
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
      <div className={classes.buttonContainer}>
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

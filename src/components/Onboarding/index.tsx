import { useState } from "react";
import { makeStyles, useTheme, Typography, Card } from "@material-ui/core";
import { Help } from "@material-ui/icons";
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
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
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
    <div>
      <ContentCard />
    </div>
  );
}

function OnboardingHeader() {
  const classes = useStyles();
  return (
    <div className={classes.header}>
      <div className={classes.headerLabel}>
        <Typography>
          <b>Beta</b>
        </Typography>
      </div>
      <div className={classes.headerButton}>
        <Help className={classes.helpIcon} />
        <Typography className={classes.helpText}>Help</Typography>
      </div>
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
  //  const URL_200 =
  //    "https://aws1.discourse-cdn.com/standard11/uploads/x200ms/original/1X/c1f521d52dadc8467bf0c500c6889edae203424e.png";
  const URL =
    "https://camo.githubusercontent.com/0542190d13e5a50f7d601abc4bfde84cf02af2ca786af519e78411f43f3ca9c0/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3831333434343531343934393130333635382f3839303237383532303535333630333039322f6578706f72742e706e673f77696474683d373436266865696768743d373436";
  return (
    <div className={classes.logoContainer}>
      <img
        src={URL}
        style={{
          width: "175px",
          height: "175px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

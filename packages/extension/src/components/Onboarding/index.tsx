import { useState } from "react";
import { useTheme, Button, Card } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { CreateNewWallet } from "./CreateNewWallet";
import { ImportWallet } from "./ImportWallet";
import { BackpackHeader } from "../Locked";

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
          <Button onClick={() => didSelectContent("create-new-wallet")}>
            Create New Wallet
          </Button>
          <Button
            style={{
              marginTop: "10px",
            }}
            color="secondary"
            onClick={() => didSelectContent("import-wallet")}
          >
            Import Wallet
          </Button>
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

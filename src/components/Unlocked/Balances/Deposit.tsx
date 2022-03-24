import { makeStyles, useTheme } from "@material-ui/core";
import { WithHeaderButton } from "./Token";
import { BottomCard } from "./Send";

const useStyles = makeStyles((theme: any) => ({
  headerButton: {
    borderRadius: "12px",
    width: "100px",
    height: "40px",
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
    textTransform: "none",
  },
}));

export function DepositButton({ token }: any) {
  return (
    <WithHeaderButton
      label={"Deposit"}
      dialogTitle={`${token.ticker} / Deposit`}
      dialog={(setOpenDrawer: any) => (
        <Deposit token={token} close={() => setOpenDrawer(false)} />
      )}
    />
  );
}

function Deposit({ token, close }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        Deposit
      </div>
      <div
        style={{
          height: "439px",
        }}
      >
        <BottomCard
          buttonLabel={"Close"}
          onButtonClick={close}
          buttonStyle={{
            backgroundColor: `${theme.custom.colors.nav} !important`,
          }}
          buttonLabelStyle={{
            fontColor: theme.custom.colors.fontColor,
          }}
        >
          <div></div>
        </BottomCard>
      </div>
    </div>
  );
}

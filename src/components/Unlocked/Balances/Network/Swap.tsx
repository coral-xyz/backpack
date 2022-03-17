import { useState } from "react";
import { makeStyles, Button, Typography, IconButton } from "@material-ui/core";
import { SwapVert } from "@material-ui/icons";
import { TextField, TextFieldLabel } from "../../../common";
import { NetworkFeeInfo } from "../Send";

const useStyles = makeStyles((theme: any) => ({
  container: {
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    paddingBottom: "38px",
  },
  bottomHalf: {},
  bottomHalfContent: {
    background: theme.custom.colors.swapGradient,
    flex: 1,
    paddingBottom: "12px",
    paddingTop: "38px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    position: "relative",
  },
  bottomHalfFooter: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  reviewBtn: {
    marginTop: "16px",
    marginBottom: "16px",
    borderRadius: "12px",
    backgroundColor: theme.custom.colors.nav,
    flex: 1,
    height: "48px",
  },
  reviewBtnLabel: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    textTransform: "none",
    color: theme.custom.colors.fontColor,
  },
  fromFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
  },
  receiveFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
  },
  swapTokensContainer: {
    backgroundColor: theme.custom.colors.background,
    width: "44px",
    height: "44px",
    position: "absolute",
    top: "-24px",
    left: "24px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  swapTokensButton: {
    backgroundColor: theme.custom.colors.nav,
    width: "38px",
    height: "38px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  swapIcon: {
    color: theme.custom.colors.secondary,
  },
}));

export function Swap({ blockchain, cancel, onCancel }: any) {
  const classes = useStyles();
  const fromTokenBalance = 0; // todo
  const [fromAmount, setFromAmount] = useState(0); // todo
  const [toAmount, setToAmount] = useState(0); // todo
  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
        <TextFieldLabel leftLabel={"You Pay"} rightLabel={fromTokenBalance} />
        <TextField
          rootClass={classes.fromFieldRoot}
          type={"number"}
          value={fromAmount}
          setValue={setFromAmount}
        />
      </div>
      <div className={classes.bottomHalfContent}>
        <SwapTokensButton />
        <TextFieldLabel leftLabel={"You Receive"} rightLabel={""} />
        <TextField
          rootClass={classes.receiveFieldRoot}
          type={"number"}
          value={toAmount}
          setValue={setToAmount}
        />
        <div style={{ marginTop: "16px" }}>
          <NetworkFeeInfo />
        </div>
      </div>
      <div className={classes.bottomHalfFooter}>
        {cancel && <CancelButton onCancel={onCancel} />}
        <ReviewButton />
      </div>
    </div>
  );
}

function CancelButton({ onCancel }: any) {
  const classes = useStyles();
  return (
    <Button
      onClick={onCancel}
      disableRipple
      disableElevation
      className={classes.reviewBtn}
      style={{ marginRight: "8px" }}
    >
      <Typography className={classes.reviewBtnLabel}>Cancel</Typography>
    </Button>
  );
}

function ReviewButton() {
  const classes = useStyles();
  return (
    <Button disableRipple disableElevation className={classes.reviewBtn}>
      <Typography className={classes.reviewBtnLabel}>Review Swap</Typography>
    </Button>
  );
}

function SwapTokensButton() {
  const classes = useStyles();
  return (
    <div className={classes.swapTokensContainer}>
      <IconButton disableRipple className={classes.swapTokensButton}>
        <SwapVert className={classes.swapIcon} />
      </IconButton>
    </div>
  );
}

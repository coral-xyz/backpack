import { Blockchain } from "@coral-xyz/common";
import { useEffect, useRef, useState } from "react";
import { Loading } from "../../common";
import { useNavStack } from "../../common/Layout/NavStack";
import { Typography } from "@mui/material";
import { CustomTheme, styles } from "@coral-xyz/themes";

const STRIP_RAMP_URL = "https://auth.xnfts.dev";

const useStyles = styles((theme: CustomTheme) => ({
  outerContainer: {
    height: "80vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  innerContainer: {
    justifyContent: "center",
    display: "flex",
  },
}));

export const StripeRamp = ({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [transactionFailed, setTransactionFailed] = useState(false);
  const [transactionSucceeded, setTransactionSucceeded] = useState(false);

  const classes = useStyles();
  const ref = useRef<any>();

  const fetchTransactionStatus = () => {
    return new Promise((resolve, reject) => {
      fetch(`${STRIP_RAMP_URL}/onramp/session/${clientSecret}`)
        .then(async (response) => {
          const json = await response.json();
          resolve(json.status);
        })
        .catch(reject);
    });
  };

  const verifyTransaction = () => {
    window.setTimeout(async () => {
      const status = await fetchTransactionStatus().catch((e) => {
        console.warn(`Error while verifying transaction ` + e);
      });
      if (status === "fulfillment_complete") {
        setTransactionSucceeded(true);
      } else {
        setTransactionFailed(true);
      }
    }, 8000);
  };

  useEffect(() => {
    setLoading(true);
    let interval: number;
    fetch(
      `${STRIP_RAMP_URL}/onramp/session?publicKey=${publicKey}&chain=${blockchain}`,
      {
        method: "POST",
      }
    )
      .then(async (response) => {
        const json = await response.json();
        setLoading(false);
        setClientSecret(json.secret);
        const popupWindow = window.open(
          `https://doof72pbjabye.cloudfront.net/stripe-onramp.html?clientSecret=${json.secret}`,
          "blank",
          `toolbar=no,
            location=no,
            status=no,
            menubar=no,
            scrollbars=yes,
            resizable=no,
            width=360,
            height=500`
        );
        interval = window.setInterval(() => {
          if (popupWindow?.closed) {
            setPopupClosed(true);
            clearInterval(interval);
            verifyTransaction();
          }
        }, 1500);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
    return () => {
      clearInterval(interval);
    };
  }, [blockchain, publicKey]);

  if (loading) {
    return (
      <div style={{ height: "100%" }}>
        <div style={{ height: "90vh" }}>
          {" "}
          <Loading />{" "}
        </div>
      </div>
    );
  }

  if (transactionFailed) {
    return (
      <div className={classes.outerContainer}>
        <div className={classes.innerContainer}>
          <Typography variant={"subtitle1"}>Transaction succeeded!</Typography>
        </div>
      </div>
    );
  }

  if (transactionSucceeded) {
    return (
      <div className={classes.outerContainer}>
        <div className={classes.innerContainer}>
          <Typography variant={"subtitle1"}>Transaction succeeded!</Typography>
        </div>
      </div>
    );
  }

  if (popupClosed) {
    return (
      <div className={classes.outerContainer}>
        <div className={classes.innerContainer}>
          <Typography variant={"subtitle1"}>Verifying Transaction</Typography>
        </div>
        <br />
        <div className={classes.innerContainer}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ height: "100%" }}>
      {clientSecret && (
        <div className={classes.outerContainer}>
          <div className={classes.innerContainer}>
            <Typography variant={"subtitle1"}>
              Complete payment in the popup
            </Typography>
            <br />
          </div>
          <div className={classes.innerContainer}>
            <Loading />
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { Loading, PrimaryButton } from "@coral-xyz/react-common";
import type { CustomTheme } from "@coral-xyz/themes";
import { styles } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { useDrawerContext } from "../../common/Layout/Drawer";

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
    color: theme.custom.colors.secondary,
  },
  innerContainerPad: {
    padding: "0px 30px",
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
  const { close } = useDrawerContext();
  const [, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [, setClientSecret] = useState(false);
  const classes = useStyles();

  const fetchToken = () => {
    setLoading(true);
    setErr("");
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
        window.open(
          `https://doof72pbjabye.cloudfront.net/stripe.html?clientSecret=${json.secret}`,
          "blank",
          `toolbar=no,
            location=no,
            status=no,
            menubar=no,
            scrollbars=yes,
            resizable=no,
            width=400,
            height=600`
        );
        close();
      })
      .catch((e) => {
        console.error(e);
        setErr("Error while fetching token from Stripe");
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchToken();
  }, [blockchain, publicKey]);

  return (
    <div className={classes.outerContainer}>
      {" "}
      {err ? <>
        <div className={classes.innerContainer}>
          <Typography variant="subtitle1">{err}</Typography>
        </div>
        <br />
        <div className={classes.innerContainerPad}>
          <PrimaryButton label="Try again" onClick={() => fetchToken()} />
        </div>
      </> : null}
      {!err ? <div className={classes.innerContainer}>
        <Loading />{" "}
      </div> : null}
    </div>
  );
};

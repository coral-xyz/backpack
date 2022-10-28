import { Blockchain } from "@coral-xyz/common";
import { useEffect, useRef, useState } from "react";
import { Loading } from "../../common";
import { useNavStack } from "../../common/Layout/NavStack";

const STRIP_RAMP_URL = "https://onramp.backpack.workers.dev/session";

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
  const nav = useNavStack();

  const ref = useRef<any>();

  useEffect(() => {
    setLoading(true);
    let interval: number;
    fetch(`${STRIP_RAMP_URL}?publicKey=${publicKey}&chain=${blockchain}`)
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

  if (popupClosed) {
    return <div>processing request</div>;
  }

  return (
    <div ref={ref} style={{ height: "100%" }}>
      {clientSecret && (
        <div
          style={{
            height: "90vh",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div>
            Complete payment in the popup
            <Loading />
          </div>
        </div>
      )}
    </div>
  );
};

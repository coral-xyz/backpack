import { Blockchain } from "@coral-xyz/common";
import { useEffect, useRef, useState } from "react";
import { Loading } from "../../common";

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
  const ref = useRef<any>();
  useEffect(() => {
    setLoading(true);
    fetch(`${STRIP_RAMP_URL}?publicKey=${publicKey}&chain=${blockchain}`)
      .then(async (response) => {
        const json = await response.json();
        setLoading(false);
        setClientSecret(json.secret);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [blockchain, publicKey]);

  return (
    <div style={{ height: "100%" }}>
      {loading && (
        <div style={{ height: "90vh" }}>
          {" "}
          <Loading />{" "}
        </div>
      )}
      <div ref={ref} style={{ height: "100%" }}>
        {clientSecret && (
          <iframe
            style={{ border: "none", width: "100vw", height: "100%" }}
            src={`https://doof72pbjabye.cloudfront.net/stripe-onramp.html?clientSecret=${clientSecret}`}
          />
        )}
      </div>
    </div>
  );
};

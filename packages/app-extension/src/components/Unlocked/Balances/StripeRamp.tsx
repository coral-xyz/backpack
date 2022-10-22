import { Blockchain } from "@coral-xyz/common";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    setLoading(false);
    fetch(`${STRIP_RAMP_URL}/?publicKey=${publicKey}&chain=${blockchain}`).then(
      async (response) => {
        const json = await response.json();
        console.error(json.secret);
      }
    );
  }, [blockchain, publicKey]);

  return (
    <div>
      {loading && <Loading />}
      <div id={"stripe-onramp"}>
        {" "}
        hi there {blockchain} {publicKey}
      </div>
    </div>
  );
};

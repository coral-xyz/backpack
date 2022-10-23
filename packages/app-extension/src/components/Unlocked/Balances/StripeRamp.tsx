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
  const ref = useRef<any>();
  useEffect(() => {
    setLoading(true);
    fetch(`${STRIP_RAMP_URL}?publicKey=${publicKey}&chain=${blockchain}`)
      .then(async (response) => {
        const json = await response.json();
        setLoading(false);
        ramp(json.secret);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [blockchain, publicKey]);

  const ramp = (clientSecret: string) => {
    // @ts-ignore
    const stripeOnramp = window.StripeOnramp(
      "pk_test_51LMFWCJLePnGviG0CZZX0ZxTwa4RUfUHFzuzPJF9BWhY8c7Zj4jPU41Fo7HYVtDOa6oQZPGNn8kuhyNzZKUNTmlM001ni6WCno"
    );
    // Get session id from `text` which contains the client secret
    const words = clientSecret.split("_");
    const session_id = `${words[0]}_${words[1]}`;
    console.log(`session_id: ${session_id}`);
    // Set session_id in dom before proceeding
    let node = document.createTextNode(session_id);
    //@ts-ignore
    ref.current?.appendChild(node);
    //@ts-ignore
    const onrampSession = stripeOnramp.createSession({ clientSecret });
    onrampSession.mount("#onramp-element");
  };

  return (
    <div>
      {loading && <Loading />}
      <div ref={ref}></div>
    </div>
  );
};

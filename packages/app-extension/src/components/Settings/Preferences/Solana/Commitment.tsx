import { useEffect } from "react";
import { useNavStack } from "../../../Layout/NavStack";

export function PreferencesSolanaCommitment() {
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("Confirmation Commitment");
  }, [nav]);

  return <div>TODO: solana commitment</div>;
}

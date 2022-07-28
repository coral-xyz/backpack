import { useEffect } from "react";
import { useNavStack } from "../../Layout/NavStack";

export function PreferencesTrustedApps() {
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("Trusted Apps");
  }, [nav]);

  return <div>TODO: trusted apps</div>;
}

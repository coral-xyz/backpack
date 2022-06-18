import { useEffect } from "react";
import { SettingsButton } from "../Settings";
import { useNavigation } from "@coral-xyz/recoil";

export function useRootNav() {
  const { setNavButtonRight } = useNavigation();
  useEffect(() => {
    setNavButtonRight(<SettingsButton />);
    return () => {
      setNavButtonRight(null);
    };
  }, []);
}

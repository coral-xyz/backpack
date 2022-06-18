import { useEffect } from "react";
import { useNavigation } from "@coral-xyz/recoil";

function useSetRightNavBtn(btn: any) {
  const { navButtonRight, setNavButtonRight } = useNavigation();
  useEffect(() => {
    const previous = navButtonRight;
    setNavButtonRight(btn);
    return () => {
      setNavButtonRight(previous);
    };
  }, []);
}

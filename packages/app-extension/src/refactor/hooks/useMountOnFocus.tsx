import { useEffect,useState } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";
import { useFocusEffect } from "@react-navigation/native";

export function useMountOnFocusWallet(
  component: JSX.Element,
  loading: JSX.Element
): JSX.Element {
  const user = useActiveWallet();
  const [isFocused, setIsFocused] = useState(false);
  const [activePublicKey, setActivePublicKey] = useState<null | string>(null);

  useFocusEffect(() => {
    setIsFocused(true);
    setActivePublicKey(null);
    return () => {
      setIsFocused(false);
    };
  });

  useEffect(() => {
    setActivePublicKey(user.publicKey);
  }, [user]);

  if (!isFocused && activePublicKey) {
    return loading;
  }
  return component;
}

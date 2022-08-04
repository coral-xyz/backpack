import React, { useEffect } from "react";
import { useNavStack } from "../../../../common/Layout/NavStack";

export const RemoveWallet: React.FC = () => {
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Remove Wallet");
  }, [nav]);

  return <div>Remove Wallet TODO</div>;
};

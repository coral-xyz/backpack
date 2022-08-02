import React, { useEffect } from "react";
import { useNavStack } from "../../../../common/Layout/NavStack";

export const RenameWallet: React.FC = () => {
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Rename Wallet");
  }, [nav]);

  return <div>Rename Wallet TODO</div>;
};

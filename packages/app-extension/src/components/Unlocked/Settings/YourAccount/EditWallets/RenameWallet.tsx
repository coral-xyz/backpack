import React, { useEffect, useState } from "react";
import { UI_RPC_METHOD_KEYNAME_UPDATE } from "@coral-xyz/common";
import {
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { useNavigation } from "../../../../common/Layout/NavStack";

export const RenameWallet: React.FC<{ publicKey: string; name: string }> = ({
  publicKey,
  name,
}) => {
  const [walletName, setWalletName] = useState(name);
  const nav = useNavigation();
  const theme = useCustomTheme();
  const background = useBackgroundClient();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Rename Wallet" });
  }, [nav]);

  const cancel = () => {
    nav.pop();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await background.request({
      method: UI_RPC_METHOD_KEYNAME_UPDATE,
      params: [publicKey, walletName],
    });
    nav.pop();
  };

  const pubkeyDisplay =
    publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);
  const isPrimaryDisabled = walletName.trim() === "";

  return (
    <form
      onSubmit={save}
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          marginTop: "112px",
        }}
      >
        <TextInput
          autoFocus
          value={walletName}
          setValue={(e) => setWalletName(e.target.value)}
        />
        <Typography
          style={{
            color: theme.custom.colors.secondary,
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          ({pubkeyDisplay})
        </Typography>
      </div>
      <div style={{ display: "flex" }}>
        <SecondaryButton
          label="Cancel"
          onClick={() => cancel()}
          style={{
            marginRight: "8px",
          }}
        />
        <PrimaryButton label="Set" type="submit" disabled={isPrimaryDisabled} />
      </div>
    </form>
  );
};

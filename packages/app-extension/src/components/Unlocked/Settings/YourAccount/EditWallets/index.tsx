import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { toTitleCase } from "@coral-xyz/common";
import { List, ListItem } from "@coral-xyz/react-common";
import { useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { MoreHoriz } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { WalletAddress } from "../../../../common";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { ImportTypeBadge, WalletList } from "../../../../common/WalletList";
import { AddConnectWalletButton } from "../..";

export const WalletListItem: React.FC<{
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type?: string;
  isFirst: boolean;
  isLast: boolean;
  showDetailMenu: boolean;
  onClick?: () => void;
}> = ({
  blockchain,
  name,
  publicKey,
  type,
  isFirst,
  isLast,
  showDetailMenu,
  onClick,
}) => {
  const theme = useCustomTheme();
  const nav = useNavStack();
  return (
    <ListItem
      button
      key={publicKey.toString()}
      isFirst={isFirst}
      isLast={isLast}
      detail={
        showDetailMenu ? (
          <MoreHoriz
            style={{
              cursor: "pointer",
              color: theme.custom.colors.secondary,
            }}
          />
        ) : null
      }
      onClick={
        onClick
          ? onClick
          : () =>
              nav.push("edit-wallets-wallet-detail", {
                blockchain,
                publicKey,
                name,
                type,
              })
      }
      style={{ height: "48px", display: "flex", width: "100%" }}
    >
      <WalletAddress
        name={name}
        publicKey={publicKey}
        style={{
          fontWeight: 500,
          lineHeight: "24px",
          fontSize: "16px",
        }}
        nameStyle={{
          color: theme.custom.colors.fontColor,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "75px",
        }}
      />
      {type && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginLeft: "4px",
          }}
        >
          <ImportTypeBadge type={type} />
        </div>
      )}
    </ListItem>
  );
};

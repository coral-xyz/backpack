import { toTitleCase, Blockchain } from "@coral-xyz/common";
import { useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { MoreHoriz } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useEffect } from "react";
import { List, ListItem, WalletAddress } from "../../../../common";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { AddConnectWalletButton, ImportTypeBadge } from "../..";

export function EditWallets() {
  const nav = useNavStack();
  const blockchainKeyrings = useWalletPublicKeys();

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Edit wallets");

    return () => {
      nav.setTitle(title);
    };
  }, []);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      {Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => (
        <WalletList
          key={blockchain}
          blockchain={blockchain as Blockchain}
          keyring={keyring}
        />
      ))}
      {/* Hack to add margin bottom. */}
      <div style={{ height: "16px" }} />
    </div>
  );
}

function WalletList({
  blockchain,
  keyring,
}: {
  blockchain: Blockchain;
  keyring: any;
}) {
  const theme = useCustomTheme();
  const flattenedWallets = [
    ...keyring.hdPublicKeys.map((k: any) => ({ ...k, type: "derived" })),
    ...keyring.importedPublicKeys.map((k: any) => ({
      ...k,
      type: "imported",
    })),
    ...keyring.ledgerPublicKeys.map((k: any) => ({
      ...k,
      type: "ledger",
    })),
  ];

  // TODO: replace placeholder wallet avatar with stored image when available
  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography
        style={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "12px",
          color: theme.custom.colors.fontColor,
        }}
      >
        {toTitleCase(blockchain)}
      </Typography>

      <List
        style={{
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        {flattenedWallets.map(({ name, publicKey, type }, idx) => (
          <WalletListItem
            blockchain={blockchain}
            key={publicKey.toString()}
            name={name}
            publicKey={publicKey}
            type={type}
            isFirst={idx === 0}
            isLast={idx === flattenedWallets.length - 1}
          />
        ))}
      </List>
      <div
        style={{
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <AddConnectWalletButton blockchain={blockchain} />
      </div>
    </div>
  );
}

export const WalletListItem: React.FC<{
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type?: string;
  isFirst: boolean;
  isLast: boolean;
  onClick?: () => void;
}> = ({ blockchain, name, publicKey, type, isFirst, isLast, onClick }) => {
  const theme = useCustomTheme();
  const nav = useNavStack();
  return (
    <ListItem
      button
      key={publicKey.toString()}
      isFirst={isFirst}
      isLast={isLast}
      detail={
        <MoreHoriz
          style={{
            cursor: "pointer",
            color: theme.custom.colors.secondary,
          }}
        />
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

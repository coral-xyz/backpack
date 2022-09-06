import {
  toTitleCase,
  Blockchain,
  BACKPACK_FEATURE_MULTICHAIN,
} from "@coral-xyz/common";
import { useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { MoreHoriz } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useEffect } from "react";
import { List, ListItem, walletAddressDisplay } from "../../../../common";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { AddConnectWalletButton } from "../..";

export function EditWallets() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const blockchainKeyrings = useWalletPublicKeys();

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Edit wallets");
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });

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
      {BACKPACK_FEATURE_MULTICHAIN && (
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
      )}

      <List>
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
      <AddConnectWalletButton blockchain={blockchain} />
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
      style={{ display: "flex", width: "100%" }}
    >
      <img
        src={"coral.png"}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "32px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
        }}
      />
      <Typography style={{ flexGrow: 1, marginLeft: "8px" }}>{name}</Typography>
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          paddingRight: "11px",
        }}
      >
        {walletAddressDisplay(publicKey)}
      </Typography>
    </ListItem>
  );
};

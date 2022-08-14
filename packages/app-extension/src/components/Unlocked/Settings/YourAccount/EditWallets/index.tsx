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
  const wallets = useWalletPublicKeys();
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

  // TODO: filter wallets by iterated blockchain keyring name
  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <BlockchainWalletList wallets={wallets} />
      {/* Hack to add margin bottom. */}
      <div style={{ height: "16px" }} />
    </div>
  );
}

function BlockchainWalletList({
  wallets,
}: {
  wallets: ReturnType<typeof useWalletPublicKeys>;
}) {
  const flattenedWallets = [
    ...wallets.hdPublicKeys.map((k) => ({ ...k, type: "derived" })),
    ...wallets.importedPublicKeys.map((k) => ({ ...k, type: "imported" })),
    ...wallets.ledgerPublicKeys.map((k) => ({ ...k, type: "ledger" })),
  ];

  // TODO: replace placeholder wallet avatar with stored image when available
  return (
    <div>
      <List>
        {flattenedWallets.map(({ name, publicKey, type }, idx) => (
          <WalletListItem
            name={name}
            publicKey={publicKey}
            type={type}
            isFirst={idx === 0}
            isLast={idx === flattenedWallets.length - 1}
          />
        ))}
      </List>
      <AddConnectWalletButton />
    </div>
  );
}

export const WalletListItem: React.FC<{
  name: string;
  publicKey: any;
  type?: string;
  isFirst: boolean;
  isLast: boolean;
  onClick?: () => void;
}> = ({ name, publicKey, type, isFirst, isLast, onClick }) => {
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
                publicKey: publicKey.toString(),
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

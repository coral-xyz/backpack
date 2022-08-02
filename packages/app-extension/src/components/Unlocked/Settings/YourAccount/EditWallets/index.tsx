import { useWalletPublicKeys } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { Add, MoreHoriz } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useEffect } from "react";
import { List, ListItem, walletAddressDisplay } from "../../../../common";
import { useNavStack } from "../../../../common/Layout/NavStack";

const useStyles = styles((theme) => ({
  selectedAddConnect: {
    "&:hover": {
      // Disable hover color.
      background: "transparent",
    },
  },
}));

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
      <BlockchainWalletList
        wallets={wallets}
        onAddConnectWallet={() => nav.push("add-connect-wallet")}
      />
    </div>
  );
}

function BlockchainWalletList({
  onAddConnectWallet,
  wallets,
}: {
  onAddConnectWallet: () => void;
  wallets: ReturnType<typeof useWalletPublicKeys>;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const nav = useNavStack();

  const flattenedWallets = [
    ...wallets.hdPublicKeys,
    ...wallets.importedPublicKeys,
    ...wallets.ledgerPublicKeys,
  ];

  // TODO: replace placeholder wallet avatar with stored image when available
  return (
    <div>
      <List>
        {flattenedWallets.map(({ name, publicKey }, idx) => (
          <ListItem
            button
            key={publicKey.toString()}
            isLast={idx === flattenedWallets.length - 1}
            detail={
              <MoreHoriz
                style={{
                  cursor: "pointer",
                  color: theme.custom.colors.secondary,
                }}
              />
            }
            onClick={() =>
              nav.push("edit-wallets-wallet-detail", {
                publicKey: publicKey.toString(),
                name,
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
            <Typography style={{ flexGrow: 1, marginLeft: "8px" }}>
              {name}
            </Typography>
            <Typography
              style={{
                color: theme.custom.colors.secondary,
                paddingRight: "11px",
              }}
            >
              {walletAddressDisplay(publicKey)}
            </Typography>
          </ListItem>
        ))}
      </List>
      <List
        style={{
          background: theme.custom.colors.background,
          color: theme.custom.colors.secondary,
        }}
      >
        <ListItem
          isLast={true}
          onClick={onAddConnectWallet}
          classes={{ root: classes.selectedAddConnect }}
        >
          <div
            style={{
              border: `solid ${theme.custom.colors.nav}`,
              borderRadius: "40px",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              marginRight: "12px",
            }}
          >
            <Add
              style={{
                color: theme.custom.colors.secondary,
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: "14px",
              }}
            />
          </div>
          <Typography
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            Add an account
          </Typography>
        </ListItem>
      </List>
    </div>
  );
}

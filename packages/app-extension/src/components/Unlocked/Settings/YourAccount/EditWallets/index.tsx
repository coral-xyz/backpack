import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  toTitleCase,
} from "@coral-xyz/common";
import { List, ListItem } from "@coral-xyz/react-common";
import { useUser, useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { MoreHoriz } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { useAuthentication } from "../../../../../hooks/useAuthentication";
import { WalletAddress } from "../../../../common";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { ImportTypeBadge } from "../../../../common/WalletList";
import { AddConnectWalletButton } from "../..";

export function EditWallets() {
  const nav = useNavStack();
  const blockchainKeyrings = useWalletPublicKeys();
  const { checkAuthentication } = useAuthentication();
  const { username } = useUser();
  const [serverPublicKeys, setServerPublicKeys] = useState<
    Array<{ blockchain: Blockchain; publicKey: string }>
  >([]);

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Edit Wallets");

    return () => {
      nav.setTitle(title);
    };
  }, []);

  /**
   * Retrieve the list of public keys from the server
   */
  useEffect(() => {
    const jwtEnabled = !!(BACKPACK_FEATURE_USERNAMES && BACKPACK_FEATURE_JWT);
    (async () => {
      if (jwtEnabled) {
        const result = await checkAuthentication(username);
        if (result) {
          setServerPublicKeys(result.publicKeys);
        }
      }
    })();
  }, []);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      {Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => (
        <WalletList
          key={blockchain}
          blockchain={blockchain as Blockchain}
          serverPublicKeys={serverPublicKeys
            .filter((s) => s.blockchain === blockchain)
            .map((s) => s.publicKey)}
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
  serverPublicKeys,
}: {
  blockchain: Blockchain;
  keyring: any;
  serverPublicKeys: Array<string>;
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
      type: "hardware",
    })),
  ];

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedPublicKeys = serverPublicKeys
    .filter(
      (serverPublicKey) =>
        !flattenedWallets.find((key: any) => key.publicKey === serverPublicKey)
    )
    .map((publicKey) => ({
      name: "",
      publicKey,
      type: "dehydrated",
    }));

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
        {flattenedWallets
          .concat(dehydratedPublicKeys)
          .map(({ name, publicKey, type }, idx) => (
            <WalletListItem
              blockchain={blockchain}
              key={publicKey}
              name={name}
              publicKey={publicKey}
              type={type}
              isFirst={idx === 0}
              isLast={idx === flattenedWallets.length - 1}
              showDetailMenu={true}
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
          : () => {
              if (type === "dehydrated") {
                nav.push("edit-wallets-recover", {
                  blockchain,
                  publicKey,
                });
              } else {
                nav.push("edit-wallets-wallet-detail", {
                  blockchain,
                  publicKey,
                  name,
                  type,
                });
              }
            }
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

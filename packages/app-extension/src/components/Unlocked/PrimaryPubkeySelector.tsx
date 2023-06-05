import { useState } from "react";
import {
  BACKEND_API_URL,
  Blockchain,
  formatWalletAddress,
  toTitleCase,
} from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import {
  serverPublicKeys,
  useAllWallets,
  useFeatureGates,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { Header, SubtextParagraph } from "../common";
import { WithDrawer } from "../common/Layout/Drawer";

import { TokenBadge } from "./Balances/TokensWidget/TokenBadge";

export const PrimaryPubkeySelector = () => {
  const gates = useFeatureGates();
  const wallets = useRecoilValue(serverPublicKeys);
  const primaryWallets = usePrimaryWallets();
  const blockchains: Blockchain[] = [Blockchain.SOLANA, Blockchain.ETHEREUM];
  const needsMigration: Blockchain[] = [];
  const [selectedAddresses, setSelectedSolAddresses] = useState({
    [Blockchain.ETHEREUM]: "",
    [Blockchain.SOLANA]: "",
  });
  const setServerPublicKeys = useSetRecoilState(serverPublicKeys);
  const [migrationDone, setMigrationDone] = useState(false);

  blockchains.forEach((blockchain) => {
    const allBlockchainWallets = wallets.filter(
      (x) => x.blockchain === blockchain
    );
    if (allBlockchainWallets.length) {
      const isPrimaryWalletAvailable = primaryWallets.find(
        (x) => x.blockchain === blockchain
      );
      if (!isPrimaryWalletAvailable) {
        needsMigration.push(blockchain);
      }
    }
  });

  if (!gates["PRIMARY_PUBKEY_ENABLED"]) {
    return null;
  }

  return (
    <WithDrawer
      paperStyles={{
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        height: "80%",
      }}
      openDrawer={needsMigration.length > 0 ? !migrationDone : false}
      setOpenDrawer={() => {}}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header
            text={
              needsMigration.length == 1
                ? "Select a primary wallet"
                : "Select primary wallets"
            }
          />
          <SubtextParagraph>
            When others send you crypto, they'll see at least one address
            publicly associated with your username.
          </SubtextParagraph>
          {needsMigration.map((b) => (
            <MigrationInputs
              selectedAddresses={selectedAddresses[b]}
              setSelectedSolAddresses={setSelectedSolAddresses}
              key={b}
              blockchain={b}
            />
          ))}
        </Box>
        <Box
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
          }}
        >
          <PrimaryButton
            disabled={
              (needsMigration.find((x) => x === Blockchain.SOLANA) &&
                !selectedAddresses[Blockchain.SOLANA]) ||
              (needsMigration.find((x) => x === Blockchain.ETHEREUM) &&
                !selectedAddresses[Blockchain.ETHEREUM])
            }
            label={
              needsMigration.length === 1
                ? "Set primary wallet"
                : "Set primary wallets"
            }
            onClick={() => {
              needsMigration.forEach(async (blockchain) => {
                fetch(`${BACKEND_API_URL}/users/activePubkey`, {
                  method: "POST",
                  body: JSON.stringify({
                    publicKey: selectedAddresses[blockchain],
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                setServerPublicKeys((current) =>
                  current.map((c) => {
                    if (c.blockchain !== blockchain) {
                      return c;
                    }
                    if (
                      c.primary &&
                      c.publicKey !== selectedAddresses[blockchain]
                    ) {
                      return {
                        ...c,
                        primary: false,
                      };
                    }
                    if (c.publicKey === selectedAddresses[blockchain]) {
                      return {
                        ...c,
                        primary: true,
                      };
                    }
                    return c;
                  })
                );
              });
              setMigrationDone(true);
            }}
          />
        </Box>
      </div>
    </WithDrawer>
  );
};

function MigrationInputs({
  blockchain,
  selectedAddresses,
  setSelectedSolAddresses,
}: {
  blockchain: Blockchain;
  selectedAddresses: string;
  setSelectedSolAddresses: any;
}) {
  const wallets = useAllWallets();
  const theme = useCustomTheme();

  return (
    <div style={{ color: theme.custom.colors.smallTextColor }}>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        Choose primary {toTitleCase(blockchain)} wallet:
      </div>
      {wallets
        .filter((x) => x.blockchain === blockchain)
        .map((wallet) => (
          <TokenBadge
            style={{
              marginRight: 5,
              marginBottom: 5,
              fontSize: "14px",
              width: "100px",
            }}
            overwriteBackground={
              selectedAddresses === wallet.publicKey
                ? theme.custom.colors.invertedPrimary
                : theme.custom.colors.bg2
            }
            overwriteColor={
              selectedAddresses === wallet.publicKey
                ? theme.custom.colors.background
                : ""
            }
            onClick={async () => {
              setSelectedSolAddresses((x: any) => ({
                ...x,
                [blockchain]: wallet.publicKey,
              }));
            }}
            label={formatWalletAddress(wallet.publicKey)}
          />
        ))}
    </div>
  );
}

import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

import { useState } from "react";
import {
  BACKEND_API_URL,
  Blockchain,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import {
  serverPublicKeys,
  useAllWallets,
  useFeatureGates,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { WithDrawer } from "../common/Layout/Drawer";

import { TokenBadge } from "./Balances/TokensWidget/TokenBadge";

export const PrimaryPubkeySelector = () => {
  const gates = useFeatureGates();
  const wallets = useRecoilValue(serverPublicKeys);
  const primaryWallets = usePrimaryWallets();
  const blockchains: Blockchain[] = [Blockchain.SOLANA, Blockchain.ETHEREUM];
  const theme = useCustomTheme();
  const needsMigration: Blockchain[] = [];
  const [selectedAddresses, setSelectedSolAddresses] = useState({
    [Blockchain.ETHEREUM]: "",
    [Blockchain.SOLANA]: "",
  });
  const setServerPublicKeys = useSetRecoilState(serverPublicKeys);

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
    return <></>;
  }

  return (
    <WithDrawer
      paperStyles={{
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        height: "50%",
      }}
      openDrawer={needsMigration.length !== 0}
      setOpenDrawer={() => {}}
    >
      <div
        style={{
          padding: 20,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div>
          <Typography
            style={{ color: theme.custom.colors.fontColor }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Select primary addresses
          </Typography>
          <Typography
            style={{ color: theme.custom.colors.smallTextColor }}
            id="modal-modal-title"
            variant="subtitle1"
            component="h2"
          >
            When others send you crypto or NFTs, they'll see at least one
            address publicly associated with your username.
          </Typography>
          {needsMigration.map((b) => (
            <MigrationInputs
              selectedAddresses={selectedAddresses[b]}
              setSelectedSolAddresses={setSelectedSolAddresses}
              key={b}
              blockchain={b}
            />
          ))}
          <br />
        </div>
        <div>
          <PrimaryButton
            disabled={
              (needsMigration.find((x) => x === Blockchain.SOLANA) &&
                !selectedAddresses[Blockchain.SOLANA]) ||
              (needsMigration.find((x) => x === Blockchain.ETHEREUM) &&
                !selectedAddresses[Blockchain.ETHEREUM])
            }
            label={"Set primary address"}
            onClick={() => {
              needsMigration.forEach(async (blockchain) => {
                await fetch(`${BACKEND_API_URL}/users/activePubkey`, {
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
            }}
          />
        </div>
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
        Chose primary {blockchain} address
      </div>
      {wallets.map((wallet) => (
        <TokenBadge
          style={{ marginRight: 5 }}
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
          label={walletAddressDisplay(wallet.publicKey)}
        />
      ))}
    </div>
  );
}

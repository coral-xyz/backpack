import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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

import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import {
  serverPublicKeys,
  useAllWallets,
  useFeatureGates,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const PrimaryPubkeySelector = () => {
  const gates = useFeatureGates();
  const wallets = useRecoilValue(serverPublicKeys);
  const primaryWallets = usePrimaryWallets();
  const blockchains: Blockchain[] = [Blockchain.SOLANA, Blockchain.ETHEREUM];
  const needsMigration: Blockchain[] = [];

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
    <Modal
      // open={needsMigration.length !== 0}
      open={false}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Please select primary addresses for your wallets
        </Typography>

        <Typography id="modal-modal-title" variant="subtitle1" component="h2">
          These are adrresses people sent crypto to when they send crypto
          directly to your username
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {needsMigration.map((b) => (
            <MigrationInputs key={b} blockchain={b} />
          ))}
        </Typography>
      </Box>
    </Modal>
  );
};

function MigrationInputs({ blockchain }: { blockchain: Blockchain }) {
  const wallets = useAllWallets();
  const setServerPublicKeys = useSetRecoilState(serverPublicKeys);

  return (
    <div>
      Chose a {blockchain} address to set as your primary
      {wallets.map((wallet) => (
        <div
          onClick={async () => {
            await fetch(`${BACKEND_API_URL}/users/activePubkey`, {
              method: "POST",
              body: JSON.stringify({
                publicKey: wallet.publicKey,
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
                if (c.primary && c.publicKey !== wallet.publicKey) {
                  return {
                    ...c,
                    primary: false,
                  };
                }
                if (c.publicKey === wallet.publicKey) {
                  return {
                    ...c,
                    primary: true,
                  };
                }
                return c;
              })
            );
          }}
        >
          {wallet.publicKey}
        </div>
      ))}
    </div>
  );
}

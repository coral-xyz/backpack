import { useEffect, useState } from "react";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import {
  useActiveSolanaWallet,
  useAnchorContext,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { MenuItem, Select } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { PublicKey } from "@solana/web3.js";

import { createEscrow } from "../utils/secure-transfer/secureTransfer";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export const SecureTransfer = ({ remoteUserId }: { remoteUserId: string }) => {
  const [modal, setModal] = useState(false);
  const { provider, connection } = useAnchorContext();
  const background = useBackgroundClient();
  const { publicKey } = useActiveSolanaWallet();
  const [publicKeysLoading, setPublicKeysLoading] = useState(true);
  const [publicKeys, setPublicKeys] = useState<string[]>([]);
  const [selectedPublicKey, setSelectedPublickey] = useState("");

  const refreshUserPubkeys = async () => {
    setPublicKeysLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_API_URL}/users/userById?remoteUserId=${remoteUserId}`
      );
      const data = await res.json();
      setPublicKeys(
        data.publicKeys
          .filter((x) => x.blockchain === Blockchain.SOLANA)
          .map((x) => x.publicKey)
      );
    } catch (e) {
      console.error(e);
    }
    setPublicKeysLoading(false);
  };
  useEffect(() => {
    if (modal) {
      refreshUserPubkeys();
    }
  }, [modal]);

  return (
    <div>
      <MonetizationOnIcon onClick={() => setModal(true)} />
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modal}
        onClose={() => setModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box sx={style}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Secure transfer
          </Typography>
          {!publicKeysLoading && (
            <Select
              value={selectedPublicKey}
              label="Public key"
              onChange={(e) => setSelectedPublickey(e.target.value)}
            >
              {publicKeys.map((publicKey) => (
                <MenuItem value={publicKey}>{publicKey}</MenuItem>
              ))}
            </Select>
          )}
          <Button
            disabled={publicKeysLoading}
            onClick={async () => {
              if (
                !selectedPublicKey ||
                !publicKeys.includes(selectedPublicKey)
              ) {
                return;
              }
              await createEscrow(
                provider,
                background,
                connection,
                0.001,
                new PublicKey(publicKey),
                new PublicKey(selectedPublicKey)
              );
              console.log("done");
            }}
          >
            Secure transfer 1 SOL
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

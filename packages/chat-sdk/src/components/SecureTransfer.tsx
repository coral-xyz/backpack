import { useState } from "react";
import {
  useActiveSolanaWallet,
  useAnchorContext,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { PublicKey } from "@solana/web3.js";

import { createEscrow } from "../utils/secure-transfer/secureTransfer";

export const SecureTransfer = () => {
  const [modal, setModal] = useState(false);
  const { provider, connection } = useAnchorContext();
  const background = useBackgroundClient();
  const { publicKey } = useActiveSolanaWallet();

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
        <Box>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Secure transfer
          </Typography>
          <Button
            onClick={async () => {
              await createEscrow(
                provider,
                background,
                connection,
                0.001,
                publicKey,
                new PublicKey("32pAWi9PUPLjqY2UuxooCE2fsgsUuiyHisRDSC6hGpci")
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

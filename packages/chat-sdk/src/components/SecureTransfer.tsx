import { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  Blockchain,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  List,
  ListItem,
  MaxLabel,
  PrimaryButton,
  TextFieldLabel,
  TextInput,
} from "@coral-xyz/react-common";
import {
  useActiveSolanaWallet,
  useAnchorContext,
  useBackgroundClient,
  useBlockchainTokenAccount,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import CheckIcon from "@mui/icons-material/Check";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { IconButton } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BigNumber } from "ethers";

import { createEscrow } from "../utils/secure-transfer/secureTransfer";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 320,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export const SecureTransfer = ({
  remoteUserId,
  onTxFinalized,
}: {
  remoteUserId: string;
  onTxFinalized: any;
}) => {
  const [modal, setModal] = useState(false);
  const { provider, connection } = useAnchorContext();
  const background = useBackgroundClient();
  const { publicKey } = useActiveSolanaWallet();
  const [publicKeysLoading, setPublicKeysLoading] = useState(true);
  const [publicKeys, setPublicKeys] = useState<string[]>([]);
  const [selectedPublicKey, setSelectedPublickey] = useState("");
  const [amount, setAmount] = useState("0");
  const token = useBlockchainTokenAccount({
    publicKey,
    blockchain: Blockchain.SOLANA,
    tokenAddress: publicKey,
  });
  console.error(token);
  const theme = useCustomTheme();
  const refreshUserPubkeys = async () => {
    setPublicKeysLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_API_URL}/users/userById?remoteUserId=${remoteUserId}`
      );
      const data = await res.json();
      setPublicKeys(
        data.user.publicKeys
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
      <IconButton size={"small"} style={{ color: theme.custom.colors.icon }}>
        <MonetizationOnIcon
          style={{ color: theme.custom.colors.icon, fontSize: 20 }}
          onClick={() => setModal(true)}
        />
      </IconButton>
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

          <br />
          <TextFieldLabel
            leftLabel={"Amount"}
            rightLabel={`${token?.displayBalance} ${token?.ticker}`}
            rightLabelComponent={
              <MaxLabel
                amount={token?.nativeBalance}
                onSetAmount={(x) => setAmount(x.toString() / LAMPORTS_PER_SOL)}
                decimals={token?.decimals}
              />
            }
          />
          <div>
            <TextInput
              margin={"none"}
              value={amount}
              setValue={(e) => setAmount(e.target.value)}
            />
          </div>

          <br />
          <Typography id="transition-modal-title" variant="subtitle2">
            Select public key
          </Typography>
          <List>
            {publicKeys?.map((pKey, index) => (
              <ListItem
                onClick={() => setSelectedPublickey(pKey)}
                style={{ height: "48px", display: "flex", width: "100%" }}
                isFirst={index === 0}
                isLast={index === publicKeys.length - 1}
                button
                key={publicKey.toString()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div>{walletAddressDisplay(pKey)}</div>
                  <div>
                    {selectedPublicKey === pKey && <CheckIcon size={"sm"} />}
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
          <br />
          <PrimaryButton
            label={"Secure transfer SOL"}
            disabled={publicKeysLoading || !publicKey}
            onClick={async () => {
              if (
                !selectedPublicKey ||
                !publicKeys.includes(selectedPublicKey) ||
                !amount
              ) {
                return;
              }
              const { signature, counter, escrow } = await createEscrow(
                provider,
                background,
                connection,
                amount,
                new PublicKey(publicKey),
                new PublicKey(selectedPublicKey)
              );
              onTxFinalized({
                signature,
                counter,
                escrow,
              });
            }}
          ></PrimaryButton>
        </Box>
      </Modal>
    </div>
  );
};

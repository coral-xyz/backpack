import { useEffect } from "react";
import { useNavigate } from "react-router-native";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useBlockchainConnectionUrl,
} from "@coral-xyz/recoil";

export const ToggleConnection = () => {
  const background = useBackgroundClient();
  const navigate = useNavigate();
  const connectionUrl = useBlockchainConnectionUrl(Blockchain.SOLANA);

  useEffect(() => {
    background
      .request({
        method: UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
        params: [
          Blockchain.SOLANA,
          {
            connectionUrl: connectionUrl!.includes("devnet")
              ? "https://api.mainnet-beta.solana.com"
              : "https://api.devnet.solana.com",
          },
        ],
      })
      .then(() => {
        console.log({ connectionUrl });
        navigate("/");
      })
      .catch(console.error);
  }, []);

  return null;
};

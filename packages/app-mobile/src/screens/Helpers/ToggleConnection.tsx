import { UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, useSolanaConnectionUrl } from "@coral-xyz/recoil";
import { useEffect } from "react";
import { useNavigate } from "react-router-native";

export const ToggleConnection = () => {
  const background = useBackgroundClient();
  const navigate = useNavigate();
  const connectionUrl = useSolanaConnectionUrl();

  useEffect(() => {
    background
      .request({
        method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
        params: [
          connectionUrl.includes("devnet")
            ? "https://api.mainnet-beta.solana.com"
            : "https://api.devnet.solana.com",
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

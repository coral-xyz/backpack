import {
  usePublicKey,
  useConnection,
  View,
  Image,
  Text,
  Button,
} from "react-xnft";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { THEME } from "../utils/theme";

export function GodDetailScreen({ god }) {
  const publicKey = usePublicKey();
  const connection = useConnection();

  console.log("god here", god);

  const stake = async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 1000000,
      })
    );
    console.log("plugin fetching most recent blockhash");
    const { blockhash } = await connection!.getLatestBlockhash("recent");
    console.log("plugin got recent blockhash", blockhash);
    tx.recentBlockhash = blockhash;
    const signature = await window.anchorUi.send(tx);
    console.log("test: got signed transaction here", signature);
  };
  const unstake = async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 1000000,
      })
    );
    console.log("plugin fetching most recent blockhash");
    const { blockhash } = await connection!.getLatestBlockhash("recent");
    console.log("plugin got recent blockhash", blockhash);
    tx.recentBlockhash = blockhash;
    const signature = await window.anchorUi.send(tx);
    console.log("test: got signed transaction here", signature);
  };

  return (
    <View
      style={{
        marginRight: "20px",
        marginLeft: "20px",
      }}
    >
      <Image
        style={{
          marginBottom: "24px",
          display: "block",
          borderRadius: "6px",
          width: "335px",
          height: "335px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        src={god.tokenMetaUriData.image}
      />
      <Text
        style={{
          color: THEME.colors.textSecondary,
        }}
      >
        Description
      </Text>
      <Text
        style={{
          color: THEME.colors.text,
          marginBottom: "10px",
        }}
      >
        {god.tokenMetaUriData.description}
      </Text>
      <Text>{god.tokenMetaUriData.external_url}</Text>
      {god.isStaked ? (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "24px",
            marginBottom: "24px",
            backgroundColor: THEME.colors.unstake,
          }}
          onClick={() => unstake()}
        >
          Unstake
        </Button>
      ) : (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "24px",
            marginBottom: "24px",
            backgroundColor: THEME.colors.stake,
          }}
          onClick={() => stake()}
        >
          Stake
        </Button>
      )}
      <View>
        <Text style={{ color: THEME.colors.textSecondary }}>Attributes</Text>
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "4px",
            marginLeft: "-4px",
            marginRight: "-4px",
          }}
        >
          {god.tokenMetaUriData.attributes.map((attr) => {
            return (
              <View
                style={{
                  padding: "4px",
                }}
              >
                <View
                  style={{
                    borderRadius: "8px",
                    backgroundColor: THEME.colors.attributeBackground,
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                >
                  <Text
                    style={{
                      color: THEME.colors.attributeTitle,
                      fontSize: "14px",
                    }}
                  >
                    {attr.trait_type}
                  </Text>
                  <Text
                    style={{
                      color: THEME.colors.text,
                      fontSize: "16px",
                    }}
                  >
                    {attr.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

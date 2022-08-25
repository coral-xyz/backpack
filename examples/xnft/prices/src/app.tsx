import { useEffect } from "react";
import { useConnection, usePublicKey, Image, Text, View } from "react-xnft";

export function App() {
  const pk = usePublicKey();
  const conn = useConnection();
  console.log("ARMANI WTF", pk.toString());
  console.log("ARMANI CONN", conn);

  useEffect(() => {
    (async () => {
      const bh = await conn.getLatestBlockhash();
      console.log("ARMANI WTF", bh);
    })();
  }, []);

  return (
    <View>
      <Image
        src={
          "https://pbs.twimg.com/profile_images/1543714094301192193/NxpY8NiL_400x400.jpg"
        }
        onClick={() => {
          console.log("ONCLICK HEANDLER HERE ARMANI");
        }}
      />
    </View>
  );
}

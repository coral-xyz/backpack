import { useEffect } from "react";
import { useConnection, usePublicKey, Text, View } from "react-xnft";

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
      <Text>Hello, World! {pk.toString()}</Text>
    </View>
  );
}

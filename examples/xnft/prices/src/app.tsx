import { useEffect, useState } from "react";
import {
  Iframe,
  Image,
  useConnection,
  usePublicKey,
  Text,
  View,
} from "react-xnft";

export function App() {
  const [count, setCount] = useState(0);
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

  const a =
    "https://pbs.twimg.com/profile_images/1562977867948085248/af4SiYBK_400x400.jpg";
  const b =
    "https://pbs.twimg.com/profile_images/1537219386116800513/chacpod0_400x400.jpg";

  return (
    <View>
      <Iframe xnft src="http://localhost:3001" />
    </View>
  );
}

import { useEffect } from "react";
import { useConnection, usePublicKey, Text, View } from "react-xnft";

export function App() {
  const pk = usePublicKey();
  const conn = useConnection();
  console.log("ARMANI WTF", pk.toString());
  console.log("ARMANI CONN", conn);

  useEffect(() => {
    (async () => {
      const me = new PublicKey("DcpYXJsWBgkV6kck4a7cWBg6B4epPeFRCMZJjxudGKh4");
      const mint = new PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt");
      console.log("ARMANI DONE", me.toString());
      const bh = await conn.getParsedTokenAccountsByOwner(me, { mint });
      console.log("ARMANI WTF", bh);
    })();
  }, []);

  return (
    <View>
      <Text>Hello, World! {pk.toString()}</Text>
    </View>
  );
}

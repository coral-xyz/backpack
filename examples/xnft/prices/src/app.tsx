import { useState, useEffect } from "react";
import ReactXnft, { usePublicKey, Text, View } from "react-xnft";

export function App() {
  const pk = useHere();
  console.log("WTF", pk.toString());
  return (
    <View>
      <Text>Hello, World! {pk.toString()}</Text>
    </View>
  );
}

function useHere() {
  //	console.log("initial render here", window.xnft.publicKey);
  const [publicKey, setPublicKey] = useState(window.xnft.publicKey);
  useEffect(() => {
    window.xnft.on("publicKeyUpdate", () => {
      console.log("updated here", window.xnft.pubicKey);
      setPublicKey(window.xnft.publicKey);
    });
  }, [setPublicKey]);
  return publicKey;
}

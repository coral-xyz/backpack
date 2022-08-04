import { View, Text } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function Defi() {
  const { data, error } = useSWR(
    "https://api.solscan.io/amm/all?cluster=",
    fetcher
  );

  return (
    <View style={{ height: "100%" }}>
      <Text style={{ marginTop: "20px", marginLeft: "25px", fontSize: "18px" }}>
        DeFi Monitor
      </Text>

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      ></View>
    </View>
  );
}

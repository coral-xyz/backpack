import { View } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function Monitor() {
  const { data, error } = useSWR("https://api.solscan.io/chaininfo", fetcher);
  console.log("DATAAAAAA", data);

  return (
    <View style={{ height: "100%" }}>
      <View
        style={{ textAlign: "center", marginTop: "20px", fontSize: "18px" }}
      >
        Network Monitor
      </View>

      {/*  Transactions */}
      <View
        style={{
          backgroundColor: "#1f2937",
          marginLeft: "20px",
          marginRight: "20px",
          borderRadius: "12px",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
      >
        <View
          style={{
            textAlign: "left",
            marginLeft: "20px",
            fontSize: "18px",
          }}
        >
          Transactions
        </View>

        <View
          style={{ marginLeft: "20px", marginRight: "20px", fontSize: "24px" }}
        >
          {data?.data.transactionCount}
        </View>

        <View
          style={{
            backgroundColor: "#374151",
            borderRadius: "12px",
            marginRight: "10px",
            marginLeft: "10px",
          }}
        >
          <View
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "18px",
            }}
          >
            TPS: {data?.data.networkInfo.tps}
          </View>
          <View
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "18px",
            }}
          >
            Ping: 1222
          </View>
        </View>
      </View>

      {/*  Epoch */}
      <View>
        <View
          style={{
            textAlign: "left",
            marginTop: "20px",
            marginLeft: "20px",
            fontSize: "24px",
          }}
        >
          Epoch
        </View>

        <View
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "18px",
          }}
        >
          # {data?.data.epochInfo.epoch}
        </View>
        <View
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "18px",
          }}
        >
          Progress:{" "}
          {(
            (100 * data?.data.epochInfo.completedSlot) /
            data?.data.epochInfo.slotsInEpoch
          ).toFixed(2)}
          %
        </View>
        <View
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "18px",
          }}
        >
          Time remaining: {data?.data.epochInfo.remainTimeHuman}
        </View>
      </View>
    </View>
  );
}

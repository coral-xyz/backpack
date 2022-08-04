import { View, Text } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function Monitor() {
  const { data, error } = useSWR("https://api.solscan.io/chaininfo", fetcher);

  return (
    <View style={{ height: "100%" }}>
      <Text style={{ marginTop: "20px", marginLeft: "25px", fontSize: "18px" }}>
        Network Monitor
      </Text>

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/*  Epoch */}
        <View
          style={{
            backgroundColor: "#111827",
            marginTop: "20px",
            marginLeft: "20px",
            marginRight: "20px",
            borderRadius: "12px",
            paddingTop: "10px",
            paddingBottom: "10px",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 5px 8px 10px -6px #3730a3",
          }}
        >
          <Text
            style={{
              textAlign: "left",
              marginLeft: "20px",
              fontSize: "16px",
              color: "#9ca3af",
            }}
          >
            Epoch
          </Text>

          <Text
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              fontSize: "24px",
            }}
          >
            {data?.data.epochInfo.epoch}
          </Text>

          <View
            style={{
              backgroundColor: "#1f2937",
              borderRadius: "12px",
              margin: "5px 15px 5px 15px",
            }}
          >
            <View style={{ display: "flex", justifyContent: "space-around" }}>
              {/* Epoch progress */}
              <View style={{ marginTop: "10px", marginBottom: "10px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Progress
                </Text>
                <Text
                  style={{
                    fontSize: "18px",
                    color: "#f9fafb",
                  }}
                >
                  {(
                    (100 * data?.data.epochInfo.completedSlot) /
                    data?.data.epochInfo.slotsInEpoch
                  ).toFixed(2)}
                  %
                </Text>
              </View>

              {/* Epoch duration */}
              <View style={{ marginTop: "10px", marginBottom: "10px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Time remaining
                </Text>
                <Text
                  style={{
                    fontSize: "18px",
                    color: "#f9fafb",
                  }}
                >
                  {data?.data.epochInfo.remainTimeHuman}
                </Text>
              </View>
            </View>

            <View style={{ display: "flex", paddingLeft: "30px" }}>
              {/* Slot range */}
              <View style={{ marginTop: "10px", marginBottom: "10px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Slot range
                </Text>
                <View style={{ display: "flex", gap: "10px" }}>
                  <Text
                    style={{
                      fontSize: "18px",
                      color: "#f9fafb",
                    }}
                  >
                    {data?.data.epochInfo.startSlot}
                  </Text>
                  <Text style={{ fontSize: "16px", color: "#9ca3af" }}>
                    {" "}
                    to{" "}
                  </Text>
                  <Text
                    style={{
                      fontSize: "18px",
                      color: "#f9fafb",
                    }}
                  >
                    {data?.data.epochInfo.endSlot}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/*  Transactions */}
        <View
          style={{
            backgroundColor: "#111827",
            marginTop: "20px",
            marginLeft: "20px",
            marginRight: "20px",
            borderRadius: "12px",
            paddingTop: "10px",
            paddingBottom: "10px",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 5px 8px 10px -6px #3730a3",
          }}
        >
          <Text
            style={{
              textAlign: "left",
              marginLeft: "20px",
              fontSize: "16px",
              color: "#9ca3af",
            }}
          >
            Transactions
          </Text>

          <Text
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              fontSize: "24px",
            }}
          >
            {data?.data.transactionCount.toLocaleString("en-US")}
          </Text>

          <View
            style={{
              backgroundColor: "#1f2937",
              borderRadius: "12px",
              margin: "5px 15px 5px 15px",
              display: "flex",

              justifyContent: "space-around",
            }}
          >
            {/* TPS */}
            <View style={{ marginTop: "10px", marginBottom: "10px" }}>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                TPS
              </Text>
              <Text
                style={{
                  fontSize: "18px",
                  color: "#f9fafb",
                }}
              >
                {(data?.data.networkInfo.tps).toFixed(2)}
              </Text>
            </View>

            {/* Ping */}
            <View style={{ marginTop: "10px", marginBottom: "10px" }}>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Ping
              </Text>
              <Text
                style={{
                  fontSize: "18px",
                  color: "#f9fafb",
                }}
              >
                1222
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function DeFiScreen() {
  const [protocolData, setProtocolData] = useState<any>();
  const { data } = useSWR("https://api.llama.fi/charts/solana", fetcher);
  console.log("data", data ? data[data.length - 1]["totalLiquidityUSD"] : data);

  const diff = data
    ? `${
        data[data.length - 1]["totalLiquidityUSD"] >
        data[data.length - 2]["totalLiquidityUSD"]
          ? data[data.length - 2]["totalLiquidityUSD"] /
            data[data.length - 1]["totalLiquidityUSD"]
          : data[data.length - 1]["totalLiquidityUSD"] /
            data[data.length - 2]["totalLiquidityUSD"]
      }`
    : "";
  const g = data
    ? `${
        data[data.length - 1]["totalLiquidityUSD"] >
        data[data.length - 2]["totalLiquidityUSD"]
          ? "#39D98A"
          : "#FF5C5C"
      }`
    : "";

  const protocol_data = useSWR("https://api.llama.fi/protocols", fetcher);
  const filtered = protocol_data?.data?.filter(
    (data, index) => data.chain === "Solana" && data.tvl > 100000
  );
  console.log("protocol data filtered", filtered);

  const sol_details = useSWR(
    "https://api.coingecko.com/api/v3/coins/solana",
    fetcher
  );
  console.log("protocol data filtered", sol_details?.data);

  const convertToInternationalCurrencySystem = (labelValue) => {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e9
      ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
      : // Six Zeroes for Millions
      Math.abs(Number(labelValue)) >= 1.0e6
      ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
      : // Three Zeroes for Thousands
      Math.abs(Number(labelValue)) >= 1.0e3
      ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
      : Math.abs(Number(labelValue));
  };

  return (
    <View style={{ height: "100%" }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          paddingRight: "16px",
        }}
      >
        {/* TVL */}
        <View
          style={{
            flex: "1",
            paddingTop: "11px",
            paddingLeft: "12px",
            paddingRight: "11px",
            width: "166px",
            marginLeft: "16px",
            marginTop: "20px",
            paddingBottom: "16px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(30px)",
            borderRadius: "8px",
          }}
        >
          <View
            style={{
              position: "fixed",
              marginTop: "5px",
              height: "136px",
              width: "140px",
              background: "#0DD3E2",
              borderRadius: "100px",
              opacity: "0.1",
              filter: "blur(25px)",
            }}
          ></View>

          <Text
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: "400",
              lineHeight: "150%",
              alignItems: "center",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            Total Value Locked
          </Text>
          <View
            style={{
              marginTop: "11px",
              width: "100%",
              height: "1px",
              background: "rgba(255, 255, 255, 0.06)",
            }}
          ></View>
          <View
            style={{ display: "flex", flexDirection: "row", marginTop: "12px" }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: "18px",
                lineHeight: "150%",
                color: "white",
              }}
            >
              $
              {data
                ? `${data[data.length - 1]["totalLiquidityUSD"]
                    .toString()
                    .slice(0, 1)}.${data[data.length - 1]["totalLiquidityUSD"]
                    .toString()
                    .slice(0, 1)}`
                : "0"}
              b
            </Text>
            <Text
              style={{
                alignItems: "center",
                textAlign: "center",
                fontWeight: "500",
                marginTop: "5px",
                marginLeft: "4px",
                fontSize: "12px",
                lineHeight: "150%",
                color: g,
              }}
            >
              {diff.toString().slice(0, 4)}%
            </Text>
          </View>
        </View>

        {/* Protocols */}
        <View
          style={{
            flex: "1",
            paddingTop: "11px",
            paddingLeft: "12px",
            paddingRight: "11px",
            width: "166px",
            marginLeft: "16px",
            marginTop: "20px",
            paddingBottom: "16px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(30px)",
            borderRadius: "8px",
          }}
        >
          <View
            style={{
              position: "fixed",
              marginTop: "5px",
              height: "136px",
              width: "140px",
              background: "#0DD3E2",
              borderRadius: "100px",
              opacity: "0.1",
              filter: "blur(25px)",
            }}
          ></View>

          <Text
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: "400",
              lineHeight: "150%",
              alignItems: "center",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            Protocols
          </Text>
          <View
            style={{
              marginTop: "11px",
              width: "100%",
              height: "1px",
              background: "rgba(255, 255, 255, 0.06)",
            }}
          ></View>
          <View
            style={{ display: "flex", flexDirection: "row", marginTop: "12px" }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: "18px",
                lineHeight: "150%",
                color: "white",
              }}
            >
              {filtered ? filtered?.length : 0}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          paddingRight: "16px",
        }}
      >
        {/* SOL Price */}
        <View
          style={{
            flex: "1",
            paddingTop: "11px",
            paddingLeft: "12px",
            paddingRight: "11px",
            width: "166px",
            marginLeft: "16px",
            marginTop: "20px",
            paddingBottom: "16px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(30px)",
            borderRadius: "8px",
          }}
        >
          <View
            style={{
              position: "fixed",
              marginTop: "5px",
              height: "136px",
              width: "140px",
              background: "#0DD3E2",
              borderRadius: "100px",
              opacity: "0.1",
              filter: "blur(25px)",
            }}
          ></View>
          <Text
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: "400",
              lineHeight: "150%",
              alignItems: "center",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            SOL Price
          </Text>
          <View
            style={{
              marginTop: "11px",
              width: "100%",
              height: "1px",
              background: "rgba(255, 255, 255, 0.06)",
            }}
          ></View>
          <View
            style={{ display: "flex", flexDirection: "row", marginTop: "12px" }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: "18px",
                lineHeight: "150%",
                color: "white",
              }}
            >
              ${sol_details?.data?.market_data.current_price.usd}
            </Text>
            <Text
              style={{
                alignItems: "center",
                textAlign: "center",
                fontWeight: "500",
                marginTop: "5px",
                marginLeft: "4px",
                fontSize: "12px",
                lineHeight: "150%",
                color: `${
                  sol_details?.data?.market_data?.price_change_24h
                    .toString()
                    .includes("-")
                    ? "#FF5C5C"
                    : "39D98A"
                }`,
              }}
            >
              {sol_details?.data?.market_data.price_change_24h
                .toString()
                .slice(0, 4)}
              %
            </Text>
          </View>
        </View>

        {/* Mcap */}
        <View
          style={{
            flex: "1",
            paddingTop: "11px",
            paddingLeft: "12px",
            paddingRight: "11px",
            width: "166px",
            marginLeft: "16px",
            marginTop: "20px",
            paddingBottom: "16px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(30px)",
            borderRadius: "8px",
          }}
        >
          <View
            style={{
              position: "fixed",
              marginTop: "5px",
              height: "136px",
              width: "140px",
              background: "#0DD3E2",
              borderRadius: "100px",
              opacity: "0.1",
              filter: "blur(25px)",
            }}
          ></View>

          <Text
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: "400",
              lineHeight: "150%",
              alignItems: "center",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            Marketcap
          </Text>
          <View
            style={{
              marginTop: "11px",
              width: "100%",
              height: "1px",
              background: "rgba(255, 255, 255, 0.06)",
            }}
          ></View>
          <View
            style={{ display: "flex", flexDirection: "row", marginTop: "12px" }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: "18px",
                lineHeight: "150%",
                color: "white",
              }}
            >
              $
              {convertToInternationalCurrencySystem(
                sol_details?.data?.market_data.market_cap.usd
              )}
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={{
          fontStyle: "normal",
          fontWeight: "700",
          fontSize: "18px",
          lineHeight: "150%",
          color: "#FFFFFF",
          marginTop: "20px",
          marginLeft: "16px",
        }}
      >
        Protocols
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "8px",
          marginLeft: "16px",
        }}
      >
        <Text
          style={{
            fontWeight: "400",
            fontSize: "12px",
            lineHeight: "150%",
            color: "rgba(255, 255, 255, 0.45)",
          }}
        >
          Name
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: "12px",
            lineHeight: "150%",
            color: "rgba(255, 255, 255, 0.45)",
            marginLeft: "105px",
          }}
        >
          Category
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: "12px",
            lineHeight: "150%",
            color: "rgba(255, 255, 255, 0.45)",
            marginLeft: "25px",
          }}
        >
          Liquidity
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: "12px",
            lineHeight: "150%",
            color: "rgba(255, 255, 255, 0.45)",
            marginLeft: "20px",
          }}
        >
          Chg 24H
        </Text>
      </View>
      {filtered &&
        filtered?.map((item, index) => {
          return (
            <>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: "20px",
                  marginBottom: "16px",
                }}
              >
                <Text
                  style={{
                    fontWeight: "400",
                    fontSize: "12px",
                    marginLeft: "16px",
                  }}
                >
                  {index + 1}
                </Text>
                <Image
                  src={item.logo}
                  style={{
                    width: "23px",
                    height: "23px",
                    marginLeft: `${index + 1 <= 10 ? "10px" : "8px"}`,
                    borderRadius: "50px",
                  }}
                />
                <View style={{ width: "90px" }}>
                  <Text
                    style={{
                      fontStyle: "normal",
                      fontWeight: "400",
                      fontSize: "12px",
                      lineHeight: "120%",
                      color: "#0DD3E2",
                      marginLeft: "4px",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View
                  style={{
                    width: "53px",
                    justifyContent: "right",
                    alignItems: "right",
                  }}
                >
                  <Text
                    style={{
                      justifyContent: "right",
                      alignItems: "right",
                      fontStyle: "normal",
                      fontWeight: "400",
                      fontSize: "12px",
                      lineHeight: "120%",
                      color: "white",
                      marginLeft: "30px",
                    }}
                  >
                    {item.category}
                  </Text>
                </View>
                <View
                  style={{
                    width: "57px",
                    justifyContent: "right",
                    alignItems: "right",
                  }}
                >
                  <Text
                    style={{
                      justifyContent: "right",
                      alignItems: "right",
                      fontStyle: "normal",
                      fontWeight: "400",
                      fontSize: "12px",
                      lineHeight: "120%",
                      color: "white",
                      marginLeft: "35px",
                    }}
                  >
                    {convertToInternationalCurrencySystem(
                      item["chainTvls"].Solana
                    )}
                  </Text>
                </View>
                <View
                  style={{
                    width: "57px",
                    justifyContent: "right",
                    alignItems: "right",
                  }}
                >
                  <Text
                    style={{
                      justifyContent: "right",
                      alignItems: "right",
                      fontStyle: "normal",
                      fontWeight: "400",
                      fontSize: "12px",
                      lineHeight: "120%",
                      color: "white",
                      marginLeft: "65px",
                    }}
                  >
                    {item.change_1d?.toString().slice(0, 4)}%
                  </Text>
                </View>
              </View>
              <View
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: "1px",
                  width: "100%",
                  height: "1px",
                  marginLeft: "5px",
                  marginRight: "16px",
                }}
              ></View>
            </>
          );
        })}
    </View>
  );
}

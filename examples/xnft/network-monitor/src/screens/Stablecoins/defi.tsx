import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function StablecoinScreen() {
  const protocol_data = useSWR(
    "https://stablecoins.llama.fi/stablecoins?includePrices=true",
    fetcher
  );
  console.log("protocol data: ", protocol_data?.data?.peggedAssets);
  const filtered = protocol_data?.data?.peggedAssets.filter(
    (data, index) =>
      data?.chainCirculating?.Solana != undefined &&
      data?.chainCirculating?.Solana?.current?.peggedUSD > 100000
  );
  console.log("protocol data filtered", filtered);

  const mcap = useSWR("https://stablecoins.llama.fi/stablecoinchains", fetcher);
  console.log("mcap data: ", mcap?.data);
  const solana_mcap = mcap?.data?.filter(
    (data, index) => data?.gecko_id === "solana"
  );
  console.log("solana data: ", solana_mcap);

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
              marginTop: "10px",
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
            Total MCap
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
                solana_mcap?.[0].totalCirculatingUSD?.peggedUSD
              )}
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
              }}
            >
              {}
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
              marginTop: "10px",
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
            USDC Dominance
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
              {filtered
                ? (
                    (filtered[1].chainCirculating?.Solana?.current?.peggedUSD /
                      solana_mcap?.[0].totalCirculatingUSD?.peggedUSD) *
                    100
                  )
                    .toString()
                    .slice(0, 4)
                : ""}
              %
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
        Stablecoin Ranking
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
          Type
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: "12px",
            lineHeight: "150%",
            color: "rgba(255, 255, 255, 0.45)",
            marginLeft: "45px",
          }}
        >
          Circ USD
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
          Price
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
                    {item.symbol}
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
                      marginLeft: "45px",
                    }}
                  >{`${item.pegMechanism
                    .charAt(0)
                    .toUpperCase()}${item.pegMechanism
                    .toString()
                    .slice(1)}`}</Text>
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
                    $
                    {convertToInternationalCurrencySystem(
                      item.chainCirculating?.Solana?.current?.peggedUSD
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
                      marginLeft: "85px",
                    }}
                  >
                    ${`${item.price.toString().slice(0, 4)}`}
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

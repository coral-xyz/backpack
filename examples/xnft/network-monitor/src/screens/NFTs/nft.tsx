import React from "react";
import { View, Text, List, ListItem, Image, Svg, Path } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function NFTScreen() {
  const { data } = useSWR(
    "https://api.solscan.io/collection?sortBy=volume30day&offset=0&limit=20&cluster=",
    fetcher
  );

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
          margin: "0px 20px 0px 20px",
          backgroundColor: "none",
          paddingBottom: "10px",
        }}
      >
        <View
          style={{
            position: "absolute",
            marginTop: "85px",
            marginLeft: "100px",
            height: "256px",
            width: "250px",
            background: "#0DD3E2",
            borderRadius: "100px",
            opacity: "0.1",
            filter: "blur(25px)",
          }}
        ></View>

        {data &&
          data.data.map((item, index) => {
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
                  <Text style={{ fontWeight: "600", fontSize: "16px" }}>
                    {index + 1}
                  </Text>
                  <Image
                    src={item.data.avatar}
                    style={{
                      width: "44px",
                      height: "44px",
                      marginLeft: `${index + 1 <= 10 ? "10px" : "8px"}`,
                      borderRadius: "50px",
                    }}
                  />
                  <View style={{ width: "134px" }}>
                    <Text
                      style={{
                        marginLeft: "6px",
                        fontWeight: "600",
                        fontSize: "16px",
                        lineHeight: "120%",
                      }}
                    >
                      {item.data.collection}
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flewDirection: "row",
                        marginTop: "3.5px",
                      }}
                    >
                      <Text
                        style={{
                          marginLeft: "6px",
                          fontWeight: "400",
                          fontSize: "14px",
                          lineHeight: "120%",
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        Floor{" "}
                      </Text>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 5,
                          marginLeft: "8px",
                        }}
                      >
                        <Image
                          style={{
                            width: "20px",
                            height: "20px",
                          }}
                          src="https://solscan.io/static/media/solana-sol-logo.b612f140.svg"
                        />
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            lineHeight: "120%",
                            marginTop: "2px",
                          }}
                        >
                          {(item.floorPrice / 10 ** 9).toLocaleString("en-US")}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 5,
                      justifyContent: "right",
                      marginLeft: "50px",
                    }}
                  >
                    <Image
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      src="https://solscan.io/static/media/solana-sol-logo.b612f140.svg"
                    />
                    <Text
                      style={{
                        fontWeight: "400",
                        fontSize: "14px",
                        lineHeight: "120%",
                        marginTop: "2px",
                      }}
                    >
                      {convertToInternationalCurrencySystem(
                        item.volume / 10 ** 9
                      )}
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
    </View>
  );
}

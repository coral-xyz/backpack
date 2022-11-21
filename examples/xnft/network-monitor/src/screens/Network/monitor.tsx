import React, { useState } from "react";
import {
  View,
  Text,
  Svg,
  Path,
  Button,
  useNavigation,
  Iframe,
} from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function MonitorScreen() {
  const { data } = useSWR("https://api.solscan.io/chaininfo", fetcher);
  const { data: pingData } = useSWR(
    "https://ping.solana.com/mainnet-beta/last6hours",
    fetcher
  );

  const nav = useNavigation();

  console.log("data", data?.data);

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
        {/* SOL Stuff */}
        <View
          onClick={() => nav.push("sol_supply")}
          style={{
            paddingTop: "11px",
            paddingLeft: "8px",
            paddingRight: "8px",
            width: "166px",
            marginLeft: "16px",
            marginTop: "20px",
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
            Circulating Supply
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
              style={{ fontWeight: "700", fontSize: "18px", color: "#0DD3E2" }}
            >
              {convertToInternationalCurrencySystem(
                data?.data.solSupply.circulating
              )}
            </Text>
            <Text
              style={{
                marginLeft: "2px",
                marginTop: "5px",
                fontWeight: "500",
                fontSize: "12px",
                color: "rgba(255,255,255, 0.85)",
              }}
            >
              /{" "}
              {`${convertToInternationalCurrencySystem(
                data?.data.solSupply.total
              )}`}
            </Text>
          </View>
          <View
            style={{ display: "flex", flexDirection: "row", marginTop: "4px" }}
          >
            <Text
              style={{ fontWeight: "700", fontSize: "12px", color: "#0DD3E2" }}
            >
              {(data?.data.solSupply.circulatingPercent).toString().slice(0, 4)}
              %
            </Text>
            <Text
              style={{
                alignItems: "center",
                textAlign: "center",
                fontWeight: "500",
                marginLeft: "4px",
                fontSize: "12px",
                lineHeight: "150%",
                color: "rgba(255,255,255, 0.85)",
              }}
            >
              is circulating
            </Text>
          </View>
          <Text
            style={{
              marginTop: "15px",
              marginBottom: "15px",
              fontWeight: "400",
              fontSize: "12px",
              lineHeight: "150%",
              color: "rgba(255,255,255, 0.85)",
            }}
          >
            View {">"}
          </Text>
        </View>

        {/* Active Stake */}
        <View
          onClick={() => nav.push("sol_stake")}
          style={{
            paddingTop: "11px",
            paddingLeft: "8px",
            paddingRight: "8px",
            width: "166px",
            marginLeft: "11px",
            marginTop: "20px",
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
            Active Stake
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
                color: "#0DD3E2",
              }}
            >
              {convertToInternationalCurrencySystem(
                data?.data.solStakeOverview.total
              )}
            </Text>
            <Text
              style={{
                marginLeft: "2px",
                marginTop: "5px",
                fontWeight: "500",
                fontSize: "12px",
                color: "rgba(255,255,255, 0.85)",
              }}
            >
              /{" "}
              {convertToInternationalCurrencySystem(data?.data.solSupply.total)}
            </Text>
          </View>
          <View
            style={{ display: "flex", flexDirection: "row", marginTop: "4px" }}
          >
            <Text
              style={{
                fontWeight: "500",
                fontSize: "12px",
                lineHeight: "150%",
                color: "rgba(255,255,255, 0.85)",
              }}
            >
              Delinquent stake:
            </Text>
            <Text
              style={{
                marginLeft: "2px",
                fontWeight: "700",
                fontSize: "12px",
                lineHeight: "150%",
                color: "#0DD3E2",
              }}
            >
              0.2%
            </Text>
          </View>
          <Text
            style={{
              marginTop: "15px",
              fontWeight: "400",
              fontSize: "12px",
              lineHeight: "150%",
              color: "rgba(255,255,255, 0.85)",
            }}
          >
            View {">"}
          </Text>
        </View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginLeft: "16px",
          marginTop: "20px",
        }}
      >
        <Text
          style={{
            fontStyle: "normal",
            fontWeight: "700",
            fontSize: "18px",
            lineHeight: "150%",
            color: "#FFFFFF",
          }}
        >
          Transaction Count
        </Text>
        <View style={{ display: "flex", flexDirection: "column" }}>
          <Text
            style={{
              marginLeft: "6px",
              fontWeight: "700",
              fontSize: "18px",
              lineHeight: "150%",
            }}
          >
            {convertToInternationalCurrencySystem(data?.data.transactionCount)}
          </Text>
          <View
            style={{
              position: "absolute",
              marginTop: "20px",
              background: "#0DD3E2",
              borderRadius: "1px",
              width: "65px",
              height: "4px",
              marginLeft: "5px",
            }}
          ></View>
        </View>
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginLeft: "16px",
          marginTop: "10px",
        }}
      >
        <Text
          style={{
            display: "flex",
            flexDirection: "row",
            fontWeight: "400",
            fontSize: "14px",
            lineHeight: "150%",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          TPS{" "}
          <Text
            style={{
              marginLeft: "4px",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "150%",
              color: "white",
            }}
          >
            {(data?.data.networkInfo.tps).toFixed(2)}
          </Text>
        </Text>
        <Text
          style={{
            display: "flex",
            flexDirection: "row",
            marginLeft: "186px",
            fontWeight: "400",
            fontSize: "14px",
            lineHeight: "150%",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Ping{" "}
          <Text
            style={{
              marginLeft: "4px",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "150%",
              color: "white",
            }}
          >
            {Array.isArray(pingData) ? pingData[0].mean_ms : "Loading..."}
          </Text>
        </Text>
      </View>
      <View style={{ marginLeft: "47px" }}>
        <Svg
          width="14"
          height="10"
          viewBox="0 0 14 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Path
            d="M6.21913 0.976085C6.61946 0.475678 7.38054 0.475678 7.78087 0.976084L13.7002 8.3753C14.2241 9.03007 13.7579 10 12.9194 10L1.08063 10C0.24212 10 -0.224053 9.03007 0.299758 8.3753L6.21913 0.976085Z"
            fill="#0DD3E2"
          />
        </Svg>
      </View>
      <View
        style={{
          position: "absolute",
          width: "90%",
          height: "1px",
          background: "rgba(255, 255, 255, 0.06)",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      ></View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "14px",
          marginRight: "16px",
        }}
      >
        <Text
          style={{
            fontWeight: "400",
            fontSize: "14px",
            lineHeight: "150%",
            color: "rgba(255, 255, 255, 0.85)",
            marginLeft: "16px",
          }}
        >
          TPS History
        </Text>
        <View
          style={{ display: "flex", flexDirection: "row", marginLeft: "200px" }}
        >
          <View
            style={{
              width: "45.51px",
              height: "24px",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "4px",
              paddingLeft: "10px",
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                fontWeight: "500",
                marginTop: "3px",
                color: "#0DD3E2",
              }}
            >
              30m
            </Text>
          </View>
          {/* <View style={{width: "45.51px", height:"24px",  background: "rgba(255, 255, 255, 0.04)", borderRadius: "4px", marginLeft:"11px"}}>
              <Text style={{fontSize: "12px", fontWeight: "500", marginTop:"3px", marginLeft: "15px"}}>2h</Text>
            </View>
            <View style={{width: "45.51px", height:"24px",  background: "rgba(255, 255, 255, 0.04)", borderRadius: "4px", marginLeft:"11px"}}>
              <Text style={{fontSize: "12px", fontWeight: "500", marginTop:"3px", marginLeft: "15px"}}>6h</Text>
            </View> */}
        </View>
      </View>
      <View
        style={{
          height: "144px",
          width: "90%",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "7px",
          marginLeft: "20px",
          marginRight: "20px",
        }}
      >
        <Iframe
          src="https://codesandbox.io/embed/stoic-hellman-h80vp2?fontsize=14&hidenavigation=1&theme=dark&view=preview"
          style={{
            width: "90%",
            height: "144px",
            border: "0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
          title="stoic-hellman-h80vp2"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></Iframe>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginLeft: "16px",
          marginTop: "20px",
        }}
      >
        <Text
          style={{
            fontStyle: "normal",
            fontWeight: "700",
            fontSize: "18px",
            lineHeight: "150%",
            color: "#FFFFFF",
          }}
        >
          Epoch
        </Text>
        <View style={{ display: "flex", flexDirection: "column" }}>
          <Text
            style={{
              marginLeft: "6px",
              fontWeight: "700",
              fontSize: "18px",
              lineHeight: "150%",
            }}
          >
            {data?.data.currentEpoch}
          </Text>
          <View
            style={{
              position: "absolute",
              marginTop: "20px",
              background: "#0DD3E2",
              borderRadius: "1px",
              width: "38px",
              height: "4px",
              marginLeft: "5px",
            }}
          ></View>
        </View>
      </View>

      <View style={{ display: "flex", flexDirection: "row", marginTop: "9px" }}>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "16px",
          }}
        >
          <Text
            style={{
              fontStyle: "normal",
              fontWeight: "400",
              fontSize: "14px",
              lineHeight: "150%",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Process
          </Text>
          <Text
            style={{
              fontStyle: "normal",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "150%",
              color: "white",
            }}
          >
            {(data?.data.epochInfo.epochCompletedPercent)
              .toString()
              .slice(0, 4)}
            %
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "180px",
          }}
        >
          <Text
            style={{
              fontStyle: "normal",
              fontWeight: "400",
              fontSize: "14px",
              lineHeight: "150%",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Time Range
          </Text>
          <Text
            style={{
              fontStyle: "normal",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "150%",
              color: "white",
            }}
          >
            {data?.data.epochInfo.completedTimeHuman}
          </Text>
        </View>
      </View>
      <View
        style={{
          background: "gray",
          height: "8px",
          width: "90%",
          marginLeft: "16px",
          borderRadius: "2px",
          marginTop: "8px",
        }}
      >
        <View
          style={{
            width: `${data?.data.epochInfo.epochCompletedPercent}%`,
            height: "100%",
            borderRadius: "inherit",
            transition: "width .2s ease-in",
            background: "#0DD3E2",
          }}
        ></View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "8.26px",
          marginBottom: "20.6px",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "16px",
          }}
        >
          <Text
            style={{
              fontStyle: "normal",
              fontWeight: "400",
              fontSize: "14px",
              lineHeight: "150%",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            #{data?.data.epochInfo.startSlot}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "171px",
          }}
        >
          <Text
            style={{
              fontStyle: "normal",
              fontWeight: "400",
              fontSize: "14px",
              lineHeight: "150%",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            #{data?.data.epochInfo.endSlot}
          </Text>
        </View>
      </View>
    </View>
  );
}

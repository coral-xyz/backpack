import React, { useState } from "react";
import { View, Text, Svg, Path, Button } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function SOLSupplyScreen() {
  const { data } = useSWR("https://api.solscan.io/chaininfo", fetcher);
  console.log("data", data?.data.transactionCount);

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
    <View
      style={{ height: "100%", alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          flex: "1",
          paddingTop: "11px",
          paddingLeft: "12px",
          paddingRight: "11px",
          width: "343px",
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
          SOL Supply
        </Text>
        <View
          style={{
            marginTop: "11px",
            width: "100%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.06)",
          }}
        ></View>
        <Text
          style={{
            fontWeight: "700",
            fontSize: "18px",
            lineHeight: "150%",
            marginTop: "12px",
            marginBottom: "15px",
          }}
        >
          {data?.data.solSupply.total.toLocaleString("en-US")}
        </Text>
      </View>
      <View
        style={{
          flex: "1",
          paddingTop: "11px",
          paddingLeft: "12px",
          paddingRight: "11px",
          width: "343px",
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
        <Text
          style={{
            fontWeight: "700",
            fontSize: "18px",
            lineHeight: "150%",
            marginTop: "12px",
          }}
        >
          {data?.data.solSupply.circulating.toLocaleString("en-US")}
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "6px",
            marginBottom: "15px",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: "18px",
              lineHeight: "150%",
              color: "#0DD3E2",
            }}
          >
            {(data?.data.solSupply.circulatingPercent).toString().slice(0, 4)}%
          </Text>
          <Text
            style={{
              alignItems: "center",
              textAlign: "center",
              fontWeight: "400",
              marginLeft: "4px",
              fontSize: "18px",
              lineHeight: "150%",
              color: "rgba(255,255,255, 0.85)",
            }}
          >
            is circulating
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: "1",
          paddingTop: "11px",
          paddingLeft: "12px",
          paddingRight: "11px",
          width: "343px",
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
          Non-Circulating Supply
        </Text>
        <View
          style={{
            marginTop: "11px",
            width: "100%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.06)",
          }}
        ></View>
        <Text
          style={{
            fontWeight: "700",
            fontSize: "18px",
            lineHeight: "150%",
            marginTop: "12px",
            marginBottom: "15px",
          }}
        >
          {data?.data.solSupply.nonCirculating.toLocaleString("en-US")}
        </Text>
      </View>
    </View>
  );
}

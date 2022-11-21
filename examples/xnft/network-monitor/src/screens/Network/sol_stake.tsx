import React, { useState } from "react";
import { View, Text, Svg, Path, Button } from "react-xnft";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function SOLStakeScreen() {
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
          Total Stake
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
          {data?.data.solStakeOverview.total.toLocaleString("en-US")}
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
          Current Stake
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
          {data?.data.solStakeOverview.totalSolCurrent.toLocaleString("en-US")}
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
          Deliquent Stake
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
          {data?.data.solStakeOverview.totalSolDelinquent.toLocaleString(
            "en-US"
          )}
        </Text>
      </View>
    </View>
  );
}

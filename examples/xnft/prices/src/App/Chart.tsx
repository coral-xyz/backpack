import React, { useEffect, useState } from "react";
import { GraphDataPointType } from "./_types/GraphDataPointType";
import { View, Text, Svg, Path } from "react-xnft";
import { green, red } from "./_helpers/color";
import makeGraph from "./_helpers/makeGraph";
import formatPrice from "./_helpers/formatPrice";

type Props = {
  data: GraphDataPointType[];
  height: number;
  width: number;
  title: string;
  xAxis: string[];
  yAxisCount: number;
};

function Chart({ data, height, width, title, xAxis, yAxisCount = 0 }: Props) {
  const color = data[0][1] > data[data.length - 1][1] ? red : green;
  const gradientColor =
    data[0][1] > data[data.length - 1][1]
      ? `linear-gradient(rgb(0,0,0,0), rgba(239, 68, 68, 0.2))`
      : `linear-gradient(rgba(52, 211, 153, 0.2), rgb(0,0,0,0))`;
  const adjustedHeight = height;
  const graph = makeGraph(data, width, adjustedHeight);

  const yAxis: number[] = [graph.max];
  const movement = graph.max - graph.min;
  for (let i = yAxisCount; i > 0; i--) {
    yAxis.push(graph.min + (movement * i) / (yAxisCount + 1));
  }
  yAxis.push(graph.min);

  return (
    <View
      style={{
        margin: "0px 16px",
        // paddingTop: "16px",
        position: "relative",
      }}
    >
      <View
        style={{
          position: "relative",
          width: `${width}px`,
          height: `${adjustedHeight}px`,
          background: gradientColor,
          zIndex: 1,
        }}
      >
        {yAxis.map((tick, i, a) => {
          const y = (adjustedHeight * i) / (a.length - 1);
          return (
            <>
              {i < a.length - 1 && (
                <Text
                  style={{
                    position: "absolute",
                    fontSize: "14px",
                    color: "#A1A1AA",
                    textAlign: "right",
                    top: y,
                    right: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatPrice(tick)}
                </Text>
              )}
              <View
                style={{
                  position: "absolute",
                  height: "0px",
                  width: "100%",
                  top: y,
                  borderTop: ".5px solid #52525B",
                }}
              ></View>
            </>
          );
        })}
        {xAxis.map((tick, i, a) => {
          return (
            <>
              {i < a.length - 1 && (
                <Text
                  style={{
                    position: "absolute",
                    fontSize: "14px",
                    color: "#A1A1AA",
                    textAlign: "left",
                    marginLeft: "4px",
                    bottom: "0px",
                    left: (i * width) / (a.length - 1),
                    whiteSpace: "nowrap",
                  }}
                >
                  {tick}
                </Text>
              )}
              <View
                style={{
                  position: "absolute",
                  height: "100%",
                  top: "0px",
                  left: (i * width) / (a.length - 1),
                  borderLeft: ".5px solid #52525B",
                }}
              ></View>
            </>
          );
        })}
        <Svg
          style={{
            position: "relative",
            zIndex: 0,
          }}
          width={width}
          height={adjustedHeight}
        >
          <Path
            // This key is a hack to force remount
            // because d property update is not implemented
            key={graph.curve}
            d={graph.curve}
            stroke={color}
            fill="none"
            style={{
              strokeWidth: 2,
            }}
          />
        </Svg>
      </View>
    </View>
  );
}

export default Chart;

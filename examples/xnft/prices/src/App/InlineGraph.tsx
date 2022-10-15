import React, { useEffect, useState } from "react";
import { GraphDataPointType } from "./_types/GraphDataPointType";
import { View, Text, Svg, Path } from "react-xnft";
import { green, red } from "./_helpers/color";
import makeGraph from "./_helpers/makeGraph";
import formatPrice from "./_helpers/formatPrice";

type Props = {
  data: number[];
  height: number;
  width: number;
  color: string;
};

function InlineGraph({ data, height, width, color }: Props) {
  const now = Date.now();
  const week = 1000 * 60 * 60 * 24 * 7;
  const start = now - week;
  const step = week / data.length;

  const graphData: GraphDataPointType[] = data
    .slice(Math.ceil(data.length / 7) * -1)
    .map((price, i) => {
      return [start + step * i, price];
    });
  const graph = makeGraph(graphData, width, height);
  return (
    <Svg
      style={{
        position: "relative",
        zIndex: 0,
      }}
      width={width}
      height={height}
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
  );
}

export default InlineGraph;

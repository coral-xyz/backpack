import type { ColorTokens, RadiusTokens, SizeTokens } from "@tamagui/core";

import { useState } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";

import { Image, ImageStyle } from "expo-image";

import { proxyImageUrl } from "@coral-xyz/common";
import { getTokens, getVariableValue, useTheme } from "tamagui";

import { CheckIcon } from "../../index";

// THIS IMPLEMENTATION IS TERRIBLE DO NOT COPY
export function ListItemIconCore({
  image,
  radius,
  size,
  style,
  borderColor,
}: {
  image: string | null;
  radius: RadiusTokens;
  size: SizeTokens;
  style: ImageStyle;
  borderColor: ColorTokens;
}) {
  const theme = useTheme();
  const tokens = getTokens();

  const borderRadius = getRadiusValue(tokens, radius);
  const _size = getSizeValue(tokens, size);
  const borderColorValue = getBorderColorValue(borderColor, theme);
  const pixelRatioSize = PixelRatio.getPixelSizeForLayoutSize(_size);
  const imageUrl = image ? proxyImageUrl(image, pixelRatioSize) : undefined;
  const [status, setStatus] = useState("idle");

  if (status === "error") {
    return (
      <View style={[styles.lucideContainer, { height: size, width: size }]}>
        <CheckIcon color="$greenIcon" size={30} />
      </View>
    );
  }

  return (
    <Image
      recyclingKey={imageUrl}
      source={{
        uri: imageUrl,
        width: pixelRatioSize,
        height: pixelRatioSize,
      }}
      style={{
        borderRadius,
        width: size,
        height: size,
        borderColor: borderColorValue,
        ...style,
      }}
      onError={() => {
        setStatus("error");
      }}
      onLoad={() => {
        setStatus("loaded");
      }}
    />
  );
}

// The stuff down here is bad but until we upgrade tamagui, we deal with it. Do not replicate!

const getSizeValue = (tokens: any, size: SizeTokens | number) => {
  return typeof size === "string"
    ? getVariableValue(tokens.size[size] || size)
    : size;
};

const getRadiusValue = (tokens: any, radius: RadiusTokens | number) => {
  return typeof radius === "string"
    ? getVariableValue(tokens.radius[radius] || radius)
    : radius;
};

const getBorderColorValue = (
  borderColor: ColorTokens | string | undefined,
  theme: any
) => {
  const b =
    borderColor && borderColor.includes("$")
      ? borderColor.split("$")[1]
      : borderColor;

  return b ? theme[b]?.val ?? borderColor : undefined;
};

const styles = StyleSheet.create({
  lucideContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

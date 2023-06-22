import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { Image } from "expo-image";

import { proxyImageUrl } from "@coral-xyz/common";
import { useAvatarUrl } from "@coral-xyz/recoil";
import { SvgUri } from "react-native-svg";

import { useTheme } from "~hooks/useTheme";

// Caches the content-type of the image so we don't have to continue double-fetching
const cache = new Map();

// This component exists because our avatars return either SVG or PNG or GIF from 1 endpoint with no extension
// used for any user
export function UserAvatar({
  uri,
  size = 32,
  style,
}: {
  uri: string;
  size: number;
  style?: any;
}): JSX.Element {
  const [type, setType] = useState<string | undefined>(undefined);
  const width = size;
  const height = size;
  const proxiedUri = proxyImageUrl(uri, size);
  // we do this bc fetching a 1x1 image is faster than fetching a 32x32 image, etc
  const smallUri = proxyImageUrl(uri, 1);

  useEffect(() => {
    if (cache.has(smallUri)) {
      setType(cache.get(smallUri));
    } else {
      fetch(smallUri, { method: "GET" })
        .then((r) => {
          const h = new Headers(r.headers);
          const ct = h.get("content-type");
          if (ct) {
            cache.set(smallUri, ct);
            setType(ct);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [smallUri]);

  if (type === "image/svg+xml") {
    return (
      <View style={[styles.container, { width, height }]}>
        <SvgUri width={width} height={height} uri={`${smallUri}.svg`} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: proxiedUri }}
      style={[
        styles.container,
        {
          width,
          height,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "gray",
    overflow: "hidden",
  },
});

export function Avatar({
  size = 64,
  username,
}: {
  size?: number;
  username?: string;
}): JSX.Element {
  const avatarUrl = useAvatarUrl(size, username);
  const theme = useTheme();
  const outerSize = size + 6;

  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.avatarIconBackground,
        borderRadius: outerSize / 2,
        padding: 3,
        width: outerSize,
        height: outerSize,
      }}
    >
      <UserAvatar size={size} uri={avatarUrl} />
    </View>
  );
}

export const CurrentUserAvatar = ({ size = 64 }: { size?: number }) => (
  <Avatar size={size} />
);

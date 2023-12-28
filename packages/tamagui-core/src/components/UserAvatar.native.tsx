import { memo, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { SvgUri } from "react-native-svg";

// Caches the content-type of the image so we don't have to continue double-fetching
const cache = new Map();

// This component exists because our avatars return either SVG or PNG or GIF from 1 endpoint with no extension
// used for any user
export const UserAvatar = memo(function UserAvatar({
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

  useEffect(() => {
    if (cache.has(uri)) {
      setType(cache.get(uri));
    } else {
      fetch(uri, { method: "GET" })
        .then((r) => {
          const h = new Headers(r.headers);
          const ct = h.get("content-type");
          if (ct) {
            cache.set(uri, ct);
            setType(ct);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [uri]);

  if (type === "image/svg+xml") {
    return (
      <View style={[styles.container, { width, height }]}>
        <SvgUri width={width} height={height} uri={`${uri}.svg`} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
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
});

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "gray",
    overflow: "hidden",
  },
});

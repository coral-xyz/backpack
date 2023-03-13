import { useState, useEffect } from "react";
import { Image } from "react-native";

import { SvgUri } from "react-native-svg";

export function ImageSvg({
  uri,
  width = 32,
  height = 32,
  style,
}: {
  uri: string;
  width: number;
  height: number;
  style?: any;
}): JSX.Element {
  const [type, setType] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(uri, { method: "HEAD" })
      .then((r) => {
        const h = new Headers(r.headers);
        const ct = h.get("content-type");
        if (ct) {
          if (ct.includes("svg")) {
            setType("svg");
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [uri]);

  if (type === "svg") {
    const url = `${uri}.svg`;
    return <SvgUri width={width} height={height} uri={url} />;
  }

  return (
    <Image
      source={{ uri }}
      style={[
        {
          aspectRatio: 1,
          width,
          height,
          borderRadius: 100,
        },
        style,
      ]}
    />
  );
}

import { useTheme } from "@coral-xyz/tamagui";

import { LocalImage } from "./LocalImage";

export function UserIcon({ image, size, marginRight }: any) {
  // TODO(mui)
  const theme = useTheme();
  return (
    <LocalImage
      size={size || 44}
      src={image}
      style={{
        width: size || 44,
        height: size || 44,
        borderRadius: (size || 44) / 2,
        marginRight: marginRight || "8px",
        color: theme.greenText.val,
      }}
    />
  );
}

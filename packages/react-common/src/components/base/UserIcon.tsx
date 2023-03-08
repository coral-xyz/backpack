import { useCustomTheme } from "@coral-xyz/themes";

import { LocalImage } from "./LocalImage";

export function UserIcon({ image, size, marginRight }: any) {
  // TODO(mui)
  const theme = useCustomTheme();
  return (
    <LocalImage
      src={image}
      style={{
        width: size || 44,
        height: size || 44,
        borderRadius: (size || 44) / 2,
        marginRight: marginRight || "8px",
        color: theme.custom.colors.positive,
      }}
    />
  );
}

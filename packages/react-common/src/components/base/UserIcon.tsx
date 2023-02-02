import { styles } from "@coral-xyz/themes";

import { LocalImage } from "./LocalImage";

export const useStyles = styles((theme) => ({
  iconCircular: {
    width: ({ size }: any) => size,
    height: ({ size }: any) => size,
    borderRadius: ({ size }: any) => size / 2,
    marginRight: ({ marginRight }: any) => marginRight || "8px",
    color: theme.custom.colors.positive,
  },
}));

export function UserIcon({ image, size, marginRight }: any) {
  const classes = useStyles({ size: size || 44, marginRight });
  return <LocalImage src={image} className={classes.iconCircular} />;
}

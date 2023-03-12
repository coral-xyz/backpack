import { useCustomTheme } from "@coral-xyz/themes";

export const Line = () => {
  const theme = useCustomTheme();

  return (
    <div style={{ height: 1, background: theme.custom.colors.icon }} />
  );
};

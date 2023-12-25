import { useTheme } from "@coral-xyz/tamagui";

export const Line = () => {
  const theme = useTheme();

  return <div style={{ height: 1, background: theme.baseIcon.val }} />;
};

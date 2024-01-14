import { useAllUsers } from "@coral-xyz/recoil";
import { FontSizeTokens, Stack, YStack } from "tamagui";

import { darkColors } from "./../colorsv2";
import { StyledText } from "./StyledText";

export function IncognitoAvatar({
  size = 64,
  fontSize = "$xl",
  uuid,
  disabled,
  ...props
}: {
  size?: number;
  fontSize?: FontSizeTokens;
  uuid: string;
  disabled?: boolean;
} & React.ComponentProps<typeof YStack>) {
  const users = useAllUsers();

  if (users.length === 0) {
    return null;
  }

  const user = users.find((u) => u.uuid === uuid)!;
  const index = users.findIndex((u) => u.uuid === uuid);
  const initials = getInitials(user?.username ?? "?");
  const color = getAvatarColorFromIndex(index >= 0 ? index : 100);

  return (
    <Stack
      width={size}
      height={size}
      jc="center"
      style={{ position: "relative" }}
      {...props}
    >
      <Stack
        bc={color}
        opacity={0.15}
        borderRadius={size / 2}
        width={size}
        height={size}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <StyledText
        color={color}
        fontSize={fontSize}
        fontWeight="$semiBold"
        textAlign="center"
      >
        {initials}
      </StyledText>
    </Stack>
  );
}

function getAvatarColorFromIndex(index: number): string {
  const idx = (index % 14) + 1;
  const userLabel = `darkUser${idx < 10 ? "0" : ""}${idx}`;
  const c = darkColors[userLabel];
  return c;
}

function getInitials(username: string): string {
  const components = username.split(" ").filter(Boolean);
  let initials = [...components[0]][0];
  if (components.length > 1) {
    initials += [...components[1]][0];
  }
  return initials.toUpperCase();
}

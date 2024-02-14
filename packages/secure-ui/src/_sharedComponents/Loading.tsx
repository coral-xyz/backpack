import { useEffect, useState } from "react";

import { Loader, Stack } from "@coral-xyz/tamagui";

export function Loading({
  delay = 0,
  backgroundColor = "transparent",
}: {
  delay?: number;
  backgroundColor?: string;
}) {
  const [show, setShow] = useState<boolean>(delay <= 0);
  useEffect(() => {
    if (delay > 0) {
      setTimeout(() => {
        setShow(true);
      }, delay);
    }
  }, [delay]);
  return (
    <Stack
      position="absolute"
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor={backgroundColor}
    >
      {show ? <Loader /> : null}
    </Stack>
  );
}

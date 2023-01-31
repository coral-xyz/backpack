import type { Blockchain, UR } from "@coral-xyz/common";
import { URType, useAnimatedQRScanner } from "@keystonehq/animated-qr";
import { Stack } from '@mui/material';

export function ConnectHardwareKeystone({ blockchain, onNext }: {
  blockchain: Blockchain;
  onNext: (ur: UR) => void;
}) {
  const { AnimatedQRScanner, setIsDone } = useAnimatedQRScanner({});

  const handleError = (err: string) => {
    console.error(blockchain, err);
    setIsDone(false);
  };
  const handleScan = async (ur: { type: string; cbor: string }) => {
    console.log(blockchain, ur);
    onNext(ur);
  };

  return (
    <Stack direction="column" alignItems="center">
      <p>Keystone</p>
      <AnimatedQRScanner
        urTypes={[URType.CRYPTO_MULTI_ACCOUNTS]}
        handleError={handleError}
        handleScan={handleScan}
        options={{
          width: 200,
          height: 200,
          blur: false,
        }}
      />
    </Stack>
  );
}

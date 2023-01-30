import { Blockchain, UI_RPC_METHOD_KEYSTONE_IMPORT } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { URType, useAnimatedQRScanner } from "@keystonehq/animated-qr";

export function ConnectHardwareKeystone() {
  const { AnimatedQRScanner, setIsDone } = useAnimatedQRScanner({});
  const background = useBackgroundClient();

  let t = Date.now();
  const handleError = (err: string) => {
    console.log("handleError", Date.now() - t, err);
    t = Date.now();
    setIsDone(false);
  };
  const handleScan = async ({ type, cbor }: { type: string; cbor: string }) => {
    console.log("handleScan", Date.now() - t, type, cbor);
    t = Date.now();
    await background.request({
      method: UI_RPC_METHOD_KEYSTONE_IMPORT,
      params: [
        Blockchain.SOLANA,
        {type, cbor},
        ''
      ],
    });
  };

  return (
    <>
      <p>Keystone1</p>
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
    </>
  );
}

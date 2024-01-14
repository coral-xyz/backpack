import { BigNumber } from "ethers";
import { usePrepareSendTransaction, useSendTransaction } from "wagmi";

export function SendWeiButton() {
  const { config } = usePrepareSendTransaction({
    request: {
      to: "0x0000000000000000000000000000000000000000",
      value: BigNumber.from("1"),
    },
  });
  const { data, isSuccess, sendTransaction } = useSendTransaction(config);

  return (
    <div>
      <button onClick={() => sendTransaction?.()}>
        Send 1 WEI to zero address
      </button>
      {isSuccess ? (
        <div style={{ marginBottom: "8px" }}>
          Transaction: {JSON.stringify(data)}
        </div>
      ) : null}
    </div>
  );
}

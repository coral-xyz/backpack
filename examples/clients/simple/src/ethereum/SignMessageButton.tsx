import type { FC } from "react";
import { useSignMessage } from "wagmi";

export const SignMessageButton: FC = () => {
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: "Hello, world!",
  });

  return (
    <div>
      <button disabled={isLoading} onClick={() => signMessage()}>
        Sign the message: Hello, world!
      </button>
      {isSuccess ? <div>Signature: {data}</div> : null}
      {isError ? <div>Error signing message</div> : null}
    </div>
  );
};

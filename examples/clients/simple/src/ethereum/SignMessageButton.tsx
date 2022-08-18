import { FC } from "react";
import { useSignMessage } from "wagmi";

export const SignMessageButton: FC = () => {
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: "WAO",
  });

  return (
    <div>
      <button disabled={isLoading} onClick={() => signMessage()}>
        Sign the message: WAO
      </button>
      {isSuccess && <div>Signature: {data}</div>}
      {isError && <div>Error signing message</div>}
    </div>
  );
};

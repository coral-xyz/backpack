import { PublicKey } from "@solana/web3.js";

export function OpenXnftButton() {
  const onClick = () => {
    const degodsXnft = "AM8TpkQaKnoiofQZrnBWhhbmUfrDo2kWJLLoNm2kybAW";
    window.backpack.openXnft(degodsXnft);
  };
  return <button onClick={onClick}>Open xNFT</button>;
}

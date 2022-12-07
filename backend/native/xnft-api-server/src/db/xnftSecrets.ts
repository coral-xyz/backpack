import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export function fetchXnftSecret(xnftId: string) {
  // const response = await chain("query")({
  //     : [
  //         {
  //             id,
  //         },
  //         {
  //             id: true,
  //             username: true,
  //             public_keys: [{}, { blockchain: true, public_key: true }],
  //         },
  //     ],
  // });
}

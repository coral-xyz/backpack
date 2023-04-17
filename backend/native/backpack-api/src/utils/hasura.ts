import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

export const chain = Chain(HASURA_URL, {
  headers: { Authorization: `Bearer ${JWT}` },
});

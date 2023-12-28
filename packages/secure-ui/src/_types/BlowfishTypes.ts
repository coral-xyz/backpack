// npx openapi-typescript https://api.blowfish.xyz/openapi/v20230605.yaml --output Blowfish_OpenApi_v20230605.ts
import { paths } from "./Blowfish_OpenApi_v20230605";

export type SolanaScanTransactionsResponse =
  paths["/solana/v0/mainnet/scan/transactions"]["post"]["responses"][200]["content"]["application/json"];

export type EthereumScanTransactionsResponse =
  paths["/ethereum/v0/mainnet/scan/transactions"]["post"]["responses"][200]["content"]["application/json"];

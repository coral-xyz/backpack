export interface Network {
  name: string;
  // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  coinType: string;
  isTestnet: boolean;
  chainId?: string | number;
  rpcUrl?: string;
  scraperUrl?: string;
  explorerUrl?: string;
  helperUrl?: string;
}

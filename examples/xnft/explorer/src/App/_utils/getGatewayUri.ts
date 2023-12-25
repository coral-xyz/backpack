const gatewayUri = (uri: string): string =>
  uri.replace("ipfs://", "https://nftstorage.link/ipfs/");

export default gatewayUri;

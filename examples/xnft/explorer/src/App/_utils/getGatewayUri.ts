const gatewayUri = (uri: string): string =>
  uri
    .replace("ipfs://", "https://nftstorage.link/ipfs/")
    .replace("solana://", "https://www.solanadata.dev/devnet/")
    .replace("data:image", "https://www.solanadata.dev/data_uri/data:image");

export default gatewayUri;

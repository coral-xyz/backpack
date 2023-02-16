export function externalResourceUri(uri: string): string {
  return (
    uri
      // .replace(/^ipfs:\/\//, "https://nftstorage.link/ipfs/")
      .replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/")
      // .replace(/^ipfs:\/\//, "https://cloudflare-ipfs.com/ipfs/")
      .replace(/^ar:\/\//, "https://www.arweave.net/")
  );
}

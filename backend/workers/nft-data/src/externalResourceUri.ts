export function externalResourceUri(uri: string): string {
  return (
    uri
      .replace(/^ipfs:\/\//, "https://nftstorage.link/ipfs/")
      // .replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/")
      .replace(/^ar:\/\//, "https://www.arweave.net/")
  );
}

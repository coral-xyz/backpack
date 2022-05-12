/**
 * Creates NFT metadata
 * @param data
 * @return {String} JSON.stringify
 */
export default function generateMetadata(data: any): string {
  console.log("Data", data);
  const metadata = {
    name: data.title,
    description: data.description,
    external_url: data.website,
    properties: {
      icon: data.s3UrlIcon,
      bundle: data.s3UrlBundle,
    },
  };

  return JSON.stringify(metadata);
}

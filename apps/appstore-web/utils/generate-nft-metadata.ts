/**
 * Creates NFT metadata
 * @param data
 * @return {String} JSON.stringify
 */
export default function generateMetadata(data: any): string {
  const metadata = {
    name: data.title,
    description: data.description,
    external_url: data.website,
    image: data.s3UrlIcon,
    properties: {
      icon: data.s3UrlIcon,
      bundle: data.s3UrlBundle
    }
  };

  return JSON.stringify(metadata);
}

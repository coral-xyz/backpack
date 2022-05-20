const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

/**
 * Creates NFT metadata
 * @param uploadState
 * @param uploadDispatch
 * @param publicKey
 */
export default function generateMetadata(
  uploadState: any,
  uploadDispatch: any,
  publicKey: string
): string {
  const metadata = {
    name: uploadState.title,
    description: uploadState.description,
    external_url: uploadState.website,
    image: '',
    properties: {
      icon: '',
      bundle: '',
      screenshots: []
    }
  };

  const files = [].concat(
    uploadState.bundle,
    uploadState.icon
    // ...uploadState.screenshots TODO:fix
  );

  const uri = `${BUCKET_URL}/${publicKey}/${uploadState.title}`;
  for (let i = 0; i < files.length; i++) {
    if (i === 0) {
      const url = `${uri}/bundle/${files[i].name}`;

      metadata.properties.bundle = url;
      uploadDispatch({
        type: 'field',
        field: 's3UrlBundle',
        value: url
      });
    } else if (i === 1) {
      const url = `${uri}/icon/${files[i].name}`;

      metadata.image = url;
      metadata.properties.icon = url;

      uploadDispatch({
        type: 'field',
        field: 's3UrlIcon',
        value: url
      });
    } else {
      const url = `${uri}/bundle/${files[i].name}`;

      metadata.properties.screenshots.push(url);

      // TODO: fix
      uploadDispatch({
        type: 'field',
        field: 's3UrlScreenshots',
        value: url
      });
    }
  }

  return JSON.stringify(metadata);
}

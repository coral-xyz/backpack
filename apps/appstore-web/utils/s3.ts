import generateMetadata from './generate-nft-metadata';

const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

/**
 * Input Files S3 Uploader
 * @param uploadState
 * @param uploadDispatch
 * @param publicKey
 */
export async function filesS3Uploader(uploadState: any, uploadDispatch: any, publicKey: string) {
  const files = [].concat(
    uploadState.bundle,
    uploadState.icon
    // ...uploadState.screenshots
  );

  let count = 0;
  for await (const file of files) {
    let filePath = `${publicKey}/${uploadState.title}`;

    if (count === 0) {
      filePath = `${filePath}/bundle/${file.name}`;
      count++;
    } else if (count === 1) {
      filePath = `${filePath}/icon/${file.name}`;
      count++;
    } else {
      filePath = `${filePath}/screenshots/${file.name}`;
      count++;
    }

    try {
      const resp = await fetch('/api/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: filePath,
          type: file.type
        })
      });

      let { url } = await resp.json();

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-type': file.type,
          'Access-Control-Allow-Origin': '*'
        },
        body: file
      });
    } catch (err) {
      console.log('Error saving file in S3', err);
    }
  }
}

export async function metadataS3Uploader(uploadState: any, uploadDispatch: any, publicKey: string) {
  try {
    const metadata = generateMetadata(uploadState, uploadDispatch, publicKey);
    const fileName = `${publicKey}/${uploadState.title}/metadata.json`;

    const resp = await fetch('/api/s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        type: 'application/json'
      })
    });

    const { url } = await resp.json();

    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: metadata
    });

    uploadDispatch({
      type: 'field',
      field: 's3UrlMetadata',
      value: `${BUCKET_URL}${fileName}`
    });

    return `${BUCKET_URL}${fileName}`;
  } catch (err) {
    console.log('Error saving file in S3', err);
  }
}

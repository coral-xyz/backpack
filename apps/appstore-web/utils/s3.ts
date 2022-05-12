const BUCKET_URL = "https://xnfts.s3.us-west-2.amazonaws.com/";

/**
 * S3 Data Uploader
 * @param uploadState
 * @param uploadDispatch
 * @param session
 */
export default async function uploadToS3(
  uploadState: any,
  uploadDispatch: any,
  session: any
) {
  const files = [].concat(
    uploadState.bundle,
    uploadState.icon
    // ...uploadState.screenshots
  );

  let count = 0;
  for await (const file of files) {
    let folderName = `${session.user.name}/${uploadState.title}`;

    if (count === 0) {
      folderName = `${folderName}/bundle`;
      uploadDispatch({
        type: "s3",
        field: "s3UrlBundle",
        value: `${BUCKET_URL}${file.name}`,
      });
      count++;
    } else if (count === 1) {
      folderName = `${folderName}/icon`;
      uploadDispatch({
        type: "s3",
        field: "s3UrlIcon",
        value: `${BUCKET_URL}${file.name}`,
      });
      count++;
    } else {
      folderName = `${folderName}/screenshots`;
      uploadDispatch({
        type: "s3",
        field: "s3UrlScreenshots",
        value: `${BUCKET_URL}${file.name}`,
      });
      count++;
    }

    try {
      const resp = await fetch("/api/s3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${folderName}/${file.name}`,
          type: file.type,
        }),
      });

      let { url } = await resp.json();

      const a = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-type": file.type,
          "Access-Control-Allow-Origin": "*",
        },
        body: file,
      });

      console.log("URL? ", a);
    } catch (err) {
      console.log("Error saving file in S3", err);
    }
  }
}

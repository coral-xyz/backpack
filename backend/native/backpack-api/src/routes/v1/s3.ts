import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import express from "express";
import path from "path";

import { extractUserId } from "../../auth/middleware";
import {
  AWS_S3_KEY_ID,
  AWS_S3_KEY_SECRET,
  CHAT_ASSETS_AWS_BUCKET,
  CHAT_ASSETS_CLOUDFRONT_URL,
  S3_AWS_REGION,
} from "../../config";

const router = express.Router();

const s3Client = new S3Client({
  region: S3_AWS_REGION,
  credentials: {
    accessKeyId: AWS_S3_KEY_ID,
    secretAccessKey: AWS_S3_KEY_SECRET,
  },
});

router.post("/signedUrl", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid: string = req.id;
  const filename = req.body.filename;
  const extension = path.parse(filename).ext;

  const cid = Buffer.from(
    await crypto.subtle.digest("SHA-256", Buffer.from(uuid + Date.now()))
  )
    .toString("hex")
    .slice(0, 10);

  const key = `${cid}${extension}`;

  const bucketParams = {
    Bucket: CHAT_ASSETS_AWS_BUCKET,
    Key: key,
  };
  const command = new PutObjectCommand(bucketParams);

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  res.json({
    url: `${CHAT_ASSETS_CLOUDFRONT_URL}/${key}`,
    uploadUrl: signedUrl,
  });
});

export default router;

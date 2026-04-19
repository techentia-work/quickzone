import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2.client";

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/**
 * Upload file to Cloudflare R2
 */
export const uploadToR2 = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ imageUrl: string; publicId: string }> => {
  const safeName = fileName.replace(/\s+/g, "-");
  const key = `uploads/${Date.now()}-${safeName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: "public-read", // works with public dev URL
    })
  );

  return {
    imageUrl: `${PUBLIC_URL}/${BUCKET}/${key}`,
    publicId: key,
  };
};

/**
 * Delete file from Cloudflare R2
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
};

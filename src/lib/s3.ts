import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT!;
const port = parseInt(process.env.MINIO_PORT!, 10);
const accessKeyId = process.env.MINIO_ACCESS_KEY!;
const secretAccessKey = process.env.MINIO_SECRET_KEY!;
const useSsl = process.env.MINIO_USE_SSL === 'true';

if (!endpoint || !port || !accessKeyId || !secretAccessKey) {
  throw new Error("MinIO environment variables are not fully configured.");
}

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Required for MinIO
});

export const bucketName = process.env.MINIO_BUCKET!;

if (!bucketName) {
    throw new Error("MINIO_BUCKET environment variable is not configured.");
}
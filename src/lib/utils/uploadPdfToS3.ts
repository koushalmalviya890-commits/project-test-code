
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Uploads a PDF buffer to S3 and returns a signed URL for download.
 * @param buffer - PDF Buffer
 * @param fileName - Filename without extension
 * @returns A signed URL to download the uploaded PDF
 */
export async function uploadPdfToS3(buffer: Buffer, fileName: string): Promise<string> {
  const key = `${fileName}-${uuidv4()}.pdf`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ContentDisposition: `attachment; filename="${fileName}.pdf"`, // Force download
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: uploadParams.Bucket, Key: uploadParams.Key }),
    { expiresIn: 60 * 60 } // URL valid for 1 hour
  );
}

const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'healthtime-uploads';

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} folder - Folder path in S3 (e.g., 'insurance', 'medical-documents')
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} S3 URL of uploaded file
 */
const uploadToS3 = async (fileBuffer, fileName, folder = 'uploads', mimeType = 'application/octet-stream') => {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}_${sanitizedFileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'private' // Files are private by default
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3: ' + error.message);
  }
};

/**
 * Get presigned URL for file access (temporary access)
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {string} Presigned URL
 */
const getPresignedUrl = (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    throw new Error('Failed to generate presigned URL: ' + error.message);
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3: ' + error.message);
  }
};

/**
 * Extract S3 key from URL
 * @param {string} url - S3 URL
 * @returns {string} S3 key
 */
const extractKeyFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1);
  } catch (error) {
    // If URL parsing fails, assume it's already a key
    return url;
  }
};

module.exports = {
  uploadToS3,
  getPresignedUrl,
  deleteFromS3,
  extractKeyFromUrl,
  s3,
  BUCKET_NAME
};


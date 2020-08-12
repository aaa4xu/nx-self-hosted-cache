const url = require('url');

try {
  require('dotenv').config({});
} catch (_) {}

const minioAddress = url.parse(process.env.MINIO_ADDRESS || '');
if (!minioAddress.auth || !minioAddress.hostname) throw new Error('MINIO_ADDRESS is malformed');
const minioAuth = minioAddress.auth.split(':');

module.exports = {
  minio: {
    endPoint: minioAddress.hostname,
    port: minioAddress.port ? parseInt(minioAddress.port, 10) : 80,
    accessKey: minioAuth[0],
    secretKey: minioAuth[1],
    useSSL: minioAddress.protocol === 'https:',
  },
  bucket: process.env.MINIO_BUCKET || 'nx-cache',
  port: parseInt(process.env.HTTP_PORT || '8000', 10),
};

import { storage } from '../config.js'

export default {
  endpoint: storage.aws.endpoint,
  region: storage.aws.region,
  bucket: storage.bucket,
  accessKeyId: storage.aws.keyId,
  secretAccessKey: storage.aws.secretKey,
  signatureVersion: 'v4',
  apiVersion: '2006-03-01',
  s3ForcePathStyle: storage.aws.forcePathStyle,
  maxRetries: 3,
}

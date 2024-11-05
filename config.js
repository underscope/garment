import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const app = {
  port: process.env.EXAMPLE_API_PORT || 3030,
}

export const storage = {
  provider: 'aws',
  bucket: process.env.S3_BUCKET || 'test',
  aws: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
    region: process.env.S3_REGION || 'us-east-1',
    keyId: process.env.S3_ACCESS_KEY_ID || 'test-key-id',
    secretKey: process.env.S3_SECRET_ACCESS_KEY || 'test-secret',
    forcePathStyle: true,
  },
}

export default {
  ...app,
  storage,
}

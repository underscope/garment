import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const app = {
  port: process.env.EXAMPLE_API_PORT || 3030,
}

export const storage = {
  provider: 'aws',
  bucket: process.env.BUCKET || 'test-bucket',
  aws: {
    endpoint: process.env.ENDPOINT || 'http://localhost:4566',
    region: process.env.REGION || 'us-east-1',
    keyId: process.env.ACCESS_KEY_ID || 'test-key-id',
    secretKey: process.env.SECRET_ACCESS_KEY || 'test-secret',
    forcePathStyle: true,
  },
}

export default {
  ...app,
  storage,
}

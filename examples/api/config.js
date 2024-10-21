import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const app = {
  port: process.env.EXAMPLE_API_PORT || 3000,
}

export const storage = {
  provider: 'aws',
  bucket: process.env.BUCKET,
  aws: {
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION,
    keyId: process.env.ACCESS_KEY_ID,
    secretKey: process.env.SECRET_ACCESS_KEY,
    forcePathStyle: true,
  },
}

export default {
  ...app,
  storage,
}

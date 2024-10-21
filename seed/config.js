import 'dotenv/config'

export default {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  bucket: process.env.BUCKET,
  endpoint: process.env.ENDPOINT,
  forcePathStyle: true,
}

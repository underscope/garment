require('dotenv').config({ path: '../../.env' })

const storage = {
  provider: 'aws',
  bucket: process.env.BUCKET,
  aws: {
    keyId: process.env.ACCESS_KEY_ID,
    secretKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  },
}

module.exports = {
  storage,
}

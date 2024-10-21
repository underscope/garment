import S3 from 'aws-sdk/clients/s3.js'

import storageCredentials from '../config.js'

const s3 = new S3({
  signatureVersion: 'v4',
  apiVersion: '2006-03-01',
  endpoint: storageCredentials.endpoint,
  region: storageCredentials.region,
  accessKeyId: storageCredentials.accessKeyId,
  secretAccessKey: storageCredentials.secretAccessKey,
  s3ForcePathStyle: storageCredentials.forcePathStyle,
  maxRetries: 3,
})

async function doesBucketExist() {
  try {
    await s3.headBucket({ Bucket: storageCredentials.bucket }).promise()
    return true
  }
  catch (error) {
    if (error === 'NotFound')
      return false
    throw error
  }
}

async function listAllFiles() {
  if (!await doesBucketExist()) {
    await s3.createBucket({ Bucket: storageCredentials.bucket }).promise()
    return
  }
  return s3
    .listObjectsV2({
      Bucket: storageCredentials.bucket,
      Prefix: '',
    })
    .promise()
    .then(({ Contents: files = [] }) => files.map(({ Key }) => ({ Key })))
}

function deleteFiles(files) {
  if (!files.length)
    return Promise.resolve()
  return s3.deleteObjects({
    Bucket: storageCredentials.bucket,
    Delete: { Objects: files },
  }).promise()
}

listAllFiles().then(files => deleteFiles(files))

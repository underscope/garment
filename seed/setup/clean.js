import S3 from 'aws-sdk/clients/s3.js'

import awsConfig from '../aws-config.js'

const s3 = new S3(awsConfig)

async function doesBucketExist() {
  try {
    await s3.headBucket({ Bucket: awsConfig.bucket }).promise()
    return true
  }
  catch (error) {
    if (error === 'NotFound')
      return false
    throw error
  }
}

async function listAllFiles() {
  if (!await doesBucketExist())
    return []

  return s3
    .listObjectsV2({
      Bucket: awsConfig.bucket,
      Prefix: '',
    })
    .promise()
    .then(({ Contents: files = [] }) => files.map(({ Key }) => ({ Key })))
}

function deleteFiles(files) {
  if (!files.length)
    return Promise.resolve()
  return s3.deleteObjects({
    Bucket: awsConfig.bucket,
    Delete: { Objects: files },
  }).promise()
}

listAllFiles().then(files => deleteFiles(files))

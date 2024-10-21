import S3 from 'aws-sdk/clients/s3.js'

import storageCredentials from '../config.js'
import 'dotenv/config'

const s3 = new S3({
  signatureVersion: 'v4',
  accessKeyId: storageCredentials.accessKeyId,
  secretAccessKey: storageCredentials.secretAccessKey,
  region: storageCredentials.region,
  apiVersion: '2006-03-01',
  maxRetries: 3,
})

function listAllFiles() {
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

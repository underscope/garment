import { createReadStream, promises } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import S3 from 'aws-sdk/clients/s3.js'
import mime from 'mime-types'

import awsConfig from '../aws-config.js'

const { readdir, stat: getStats } = promises
const __dirname = dirname(fileURLToPath(import.meta.url))

const s3 = new S3(awsConfig)

async function createTestBucket() {
  try {
    // If already exists, return
    await s3.headBucket({ Bucket: awsConfig.bucket }).promise()
    return true
  }
  catch {
    await s3.createBucket({ Bucket: awsConfig.bucket }).promise()
    return true
  }
}

const uploadFile = async function uploadFile({ path, params, options } = {}) {
  const args = { ...params }
  try {
    const stream = createReadStream(resolve(path))
    stream.once('error', (err) => {
      console.error(`unable to upload file ${path}, ${err.message}`)
    })
    args.Body = stream
    args.ContentType = mime.lookup(args.Key)
    await s3.upload(args, options).promise()
    console.info(`${args.Key} ${args.ContentType} ⬆️ in bucket ${args.Bucket}`)
  }
  catch (e) {
    throw new Error(`unable to upload ${path} at ${args.Key}, ${e.message}`)
  }
  return true
}

const uploadDirectory = async function uploadDirectory({
  path,
  params,
  options,
  rootKey,
} = {}) {
  const opts = { ...options }
  const parameters = { ...params }
  const root = rootKey && rootKey.constructor === String ? rootKey : ''
  let dirPath
  try {
    dirPath = resolve(path)
    const dirStats = await getStats(dirPath)
    if (!dirStats.isDirectory()) {
      throw new Error(`${dirPath} is not a directory`)
    }
    console.info(`uploading directory ${dirPath}...`)
    const filenames = await readdir(dirPath)
    if (!Array.isArray(filenames))
      return true
    const uploads = filenames.map(async (filename) => {
      const filepath = `${dirPath}/${filename}`
      const fileStats = await getStats(filepath)
      if (fileStats.isFile()) {
        parameters.Key = join(root, filename)
        await uploadFile({
          path: filepath,
          params: parameters,
          options: opts,
        })
      }
      else if (fileStats.isDirectory()) {
        await uploadDirectory({
          params,
          options,
          path: filepath,
          rootKey: join(root, filename),
        })
      }
    })
    await Promise.all(uploads)
  }
  catch (e) {
    throw new Error(`unable to upload directory ${path}, ${e.message}`)
  }
  console.info(`directory ${dirPath} successfully uploaded`)
  return true
}

try {
  console.time('Upload files to S3')
  const targetFolder = join(__dirname, '../content')
  await createTestBucket()
  await uploadDirectory({
    path: targetFolder,
    params: { Bucket: awsConfig.bucket },
    options: {},
    rootKey: '',
  })
  console.timeEnd('Upload files to S3')
}
catch (e) {
  console.error(e)
}

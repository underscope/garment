import path from 'path'

import type { AWSError } from 'aws-sdk'
import mime from 'mime-types'
import S3 from 'aws-sdk/clients/s3'

import type { FileStorage, FileStorageConfig } from '../../interfaces'
import type { GetObjectResponse } from '../../types'

const noop = () => undefined
const isNotFoundError = (err: AWSError) => ['NoSuchKey', 'NotFound'].includes(err.code)

class Amazon implements FileStorage {
  #bucket: string
  #client: S3

  constructor(storage: FileStorageConfig) {
    this.#bucket = storage.bucket
    this.#client = new S3({
      accessKeyId: storage.aws.keyId,
      secretAccessKey: storage.aws.secretKey,
      region: storage.aws.region,
      signatureVersion: 'v4',
      apiVersion: '2006-03-01',
      maxRetries: 3,
    })
  }

  public getObject(key: string): Promise<GetObjectResponse<string>> {
    return this.#client
      .getObject({ Bucket: this.#bucket, Key: key })
      .promise()
      .then(({ Body }) => ({
        content: Body?.toString('utf8') || '',
        raw: Body as Buffer,
      }))
  }

  public saveObject(key: string, data: Buffer): Promise<void> {
    const contentType = mime.contentType(path.extname(key)) || undefined
    return this.#client
      .putObject({
        Bucket: this.#bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
      .promise()
      .then(noop)
  }

  public copyObject(key: string, newKey: string): Promise<void> {
    const { base, ...rest } = path.parse(key)
    const encodedSource = path.format({ base: encodeURIComponent(base), ...rest })
    return this.#client
      .copyObject({
        Bucket: this.#bucket,
        CopySource: this.path(`/${encodedSource}`),
        Key: newKey,
      })
      .promise()
      .then(noop)
  }

  public moveObject(key: string, newKey: string): Promise<void> {
    return this.copyObject(key, newKey)
      .then(() => this.deleteObject(key))
      .then(noop)
  }

  public deleteObject(key: string): Promise<void> {
    return this.#client
      .deleteObject({
        Bucket: this.#bucket,
        Key: key,
      })
      .promise()
      .then(noop)
  }

  public deleteObjects(keys: string[]): Promise<void> {
    return this.#client
      .deleteObjects({
        Bucket: this.#bucket,
        Delete: { Objects: keys.map(Key => ({ Key })) },
      })
      .promise()
      .then(noop)
  }

  public listObjects(key: string): Promise<string[]> {
    return this.#client
      .listObjectsV2({ Bucket: this.#bucket, Prefix: key })
      .promise()
      .then(({ Contents: files = [] }) => files.map(it => it.Key) as string[])
  }

  public doesObjectExist(key: string): Promise<boolean> {
    return this.#client
      .headObject({ Bucket: this.#bucket, Key: key })
      .promise()
      .then(Boolean)
      .catch(err => (isNotFoundError(err) ? false : Promise.reject(err)))
  }

  public getSignedObjectUrl(key: string): Promise<string> {
    return this.#client.getSignedUrlPromise('getObject', {
      Bucket: this.#bucket,
      Key: key,
      Expires: 3600,
    })
  }

  private path(segment: string): string {
    return path.join(this.#bucket, segment)
  }
}

export default Amazon

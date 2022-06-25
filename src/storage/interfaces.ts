import type { AWSStorageConfig } from './providers/aws/interfaces'
import type { GetObjectResponse } from './types'

export interface FileStorage {
  listObjects(key: string): Promise<string[]>
  getObject(key: string): Promise<GetObjectResponse<string>>
  saveObject(key: string, data: Buffer): Promise<void>
  copyObject(key: string, newKey: string): Promise<void>
  moveObject(key: string, newKey: string): Promise<void>
  deleteObject(key: string): Promise<void>
  deleteObjects(keys: string[]): Promise<void>
  doesObjectExist(key: string): Promise<boolean>
  getSignedObjectUrl(key: string): Promise<string>
}

export interface FileStorageConfig {
  provider: string
  bucket: string
  aws: AWSStorageConfig
}

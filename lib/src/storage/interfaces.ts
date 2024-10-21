import type { AWSStorageConfig } from './providers/aws/interfaces'
import type { GetObjectResponse } from './types'

export interface FileStorage {
  listObjects: (key: string) => Promise<string[]>
  getObject: (key: string) => Promise<GetObjectResponse<string>>
  getJSON: (key: string) => Promise<any>
  saveObject: (key: string, data: Buffer) => Promise<void>
  copyObject: (key: string, newKey: string) => Promise<void>
  copyDirectory: (path: string, newPath: string) => Promise<void>
  moveObject: (key: string, newKey: string) => Promise<void>
  deleteObject: (key: string) => Promise<void>
  deleteObjects: (keys: string[]) => Promise<void>
  doesObjectExist: (key: string) => Promise<boolean>
  getSignedObjectUrl: (key: string, secondsAvailable: number) => Promise<string>
}

export interface FileStorageConfig {
  provider: string
  bucket: string
  aws: AWSStorageConfig
}

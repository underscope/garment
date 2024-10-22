import type { GarmentEnv } from './enums'

export type FileKey = 'id' | 'uid'
export type FileKeyType = number | string

export interface GarmentConfig {
  [GarmentEnv.Source]: string
  [GarmentEnv.Snapshot]: string
  fileKeyProp: FileKey
}

export interface EntityProcessorContext {
  env: GarmentEnv
  config: GarmentConfig
}

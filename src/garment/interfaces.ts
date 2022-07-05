import type { GarmentEnv } from './enums'

export interface GarmentConfig {
  [GarmentEnv.Source]: string
  [GarmentEnv.Snapshot]: string
}

export interface EntityProcessorContext {
  env: GarmentEnv
  config: GarmentConfig
}

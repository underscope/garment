import type { GarmentEnv } from './enums'

export interface GarmentConfig {
  [GarmentEnv.Source]: string
  [GarmentEnv.Snapshot]: string
  [GarmentEnv.Cache]: string
}

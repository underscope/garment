import { Type } from 'class-transformer'
import type { GarmentEnv } from './enums'

export class CatalogItem {
  static api: any

  id: number
  uid: string
  schema: string
  name: string
  description: string
  meta: Object

  @Type(() => Date)
  publishedAt: string

  @Type(() => Date)
  detachedAt: string
}

export class Repository {
  static api: any
  env: GarmentEnv

  id: number
  uid: string
  schema: string
  name: string
  description: string
  version: string
  structure: Activity[]

  @Type(() => Date)
  publishedAt: Date

  getContainer(id: string) {
    return Repository.api.getContainer(id, this.id.toString())
  }
}

export class Activity {
  static api: any

  id: number
  uid: string
  type: string
  position: number
  meta: Object
  contentContainers: Object[]
  relationships: Object

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  @Type(() => Date)
  publishedAt: Date
}

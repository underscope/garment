import { Type } from 'class-transformer'
import { GarmentEnv } from './enums'

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
  envPath: string

  id: number
  uid: string
  schema: string
  name: string
  description: string
  version: string
  structure: Activity[]

  @Type(() => Date)
  publishedAt: Date

  get path(): string {
    return Repository.api.getRepositoryPath(this.id.toString(), this.envPath)
  }

  clone(dstPath: string) {
    return Repository.api.clone(this.path, dstPath)
  }

  snapshot(version = new Date().getTime().toString()) {
    const directory = `${this.id}/${version}`
    return Repository.api.cloneToEnv(this.path, GarmentEnv.Snapshot, directory)
  }

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

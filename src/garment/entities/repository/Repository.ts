import bytes from 'bytes'
import isString from 'lodash/isString'
import sizeof from 'object-sizeof'
import { Transform, Type, plainToClass } from 'class-transformer'

import type { FileKey } from '../../interfaces'

import { Activity, ContentContainer } from '../'
import { GarmentEnv } from '../../enums'

export class Repository {
  static api: any
  static fileKeyProp: FileKey = 'id'
  static getSnapshotKey = (id: number | string, version: string) => `${id}/${version}`

  envPath: string
  isLoaded = false

  id: number
  uid: string
  schema: string
  version: string
  name: string
  description: string
  meta: { [key: string]: any }

  @Type(() => Activity)
  @Transform(({ value, obj }) => value.map((it: any) => ({ ...it, repository: obj })))
  structure: Activity[]

  @Type(() => Date)
  publishedAt: Date

  get sourceKey(): string {
    const key = this[Repository.fileKeyProp]
    return isString(key) ? key : String(key)
  }

  get snapshotKey(): string {
    return Repository.getSnapshotKey(this.sourceKey, this.version)
  }

  get path(): string {
    return Repository.api.getRepositoryPath(this.sourceKey, this.envPath)
  }

  get size(): string {
    return bytes(sizeof(this))
  }

  get activitiesWithContainers(): Activity[] {
    return this.structure.filter(it => it.contentContainers?.length)
  }

  async load(): Promise<Repository> {
    await Promise.all(this.activitiesWithContainers.map(it => it.load()))
    this.isLoaded = true
    return this
  }

  async makePublic(): Promise<Repository> {
    await Promise.all(this.activitiesWithContainers.map(it => it.makePublic()))
    return this
  }

  clone(dstPath: string) {
    return Repository.api.clone(this.path, dstPath)
  }

  snapshot() {
    return Repository.api.cloneToEnv(this.path, GarmentEnv.Snapshot, this.snapshotKey)
  }

  async getContainer(id: string): Promise<ContentContainer> {
    const data = await Repository.api.getContainer(id, this.sourceKey)
    return plainToClass(ContentContainer, data)
  }
}

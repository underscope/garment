import bytes from 'bytes'
import isString from 'lodash/isString'
import sizeof from 'object-sizeof'
import { Type, plainToClass } from 'class-transformer'

import { Activity, ContentContainer } from '../'
import { GarmentEnv } from '../../enums'

export class Repository {
  static api: any
  static fileKeyProp: 'id' | 'uid' = 'id'

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
  structure: Activity[]

  @Type(() => Date)
  publishedAt: Date

  get fileKey(): string {
    const key = this[Repository.fileKeyProp]
    return isString(key) ? key : String(key)
  }

  get path(): string {
    return Repository.api.getRepositoryPath(this.fileKey, this.envPath)
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

  snapshot(version = this.version) {
    const directory = `${this.fileKey}/${version}`
    return Repository.api.cloneToEnv(this.path, GarmentEnv.Snapshot, directory)
  }

  async getContainer(id: string): Promise<ContentContainer> {
    const data = await Repository.api.getContainer(id, this.fileKey)
    return plainToClass(ContentContainer, data)
  }
}

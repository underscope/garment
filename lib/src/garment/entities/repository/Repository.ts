import type { FileKey } from '../../interfaces'
import bytes from 'bytes'
import { plainToClass, Type } from 'class-transformer'
import flatten from 'lodash/flatten.js'
import isString from 'lodash/isString.js'
import sizeof from 'object-sizeof'

import { Activity, ContentContainer } from '../'
import { ContentGraph } from '../../content-graph'
import { GarmentEnv } from '../../enums'

export class Repository {
  static api: any
  static fileKeyProp: FileKey = 'id'
  static getSnapshotKey = (id: number | string, version: string) => `${id}/${version}`

  env: GarmentEnv
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

  get containers(): ContentContainer[] {
    const { activitiesWithContainers: activities } = this
    return flatten(activities.map(it => it.contentContainers))
  }

  async load(): Promise<Repository> {
    await Promise.all(this.structure.map(it => it.load()))
    this.isLoaded = true
    return this
  }

  async getContentGraph(): Promise<ContentGraph> {
    if (!this.isLoaded)
      await this.load()
    const nodes = this.structure.reduce(
      (acc, it) => acc.concat(it.getSubtreeDescriptors()),
      [] as any[],
    )
    return new ContentGraph(nodes)
  }

  async makePublic(interval?: number): Promise<Repository> {
    await Promise.all([
      ...this.activitiesWithContainers.map(it => it.makePublic(interval)),
      Repository.api.processMeta(this.meta),
    ])
    return this
  }

  clone(dstPath: string) {
    return Repository.api.clone(this.path, dstPath)
  }

  snapshot() {
    const { snapshotKey } = this
    if (this.env === GarmentEnv.Snapshot) {
      const msg = `Cannot create a snapshot for existing snapshot: ${snapshotKey}`
      throw new Error(msg)
    }
    return Repository.api.cloneToEnv(this.path, GarmentEnv.Snapshot, snapshotKey)
  }

  async getContainer(id: number | string): Promise<ContentContainer> {
    const container = this.containers.find(it => it.sourceKey === id)
    if (!container)
      throw new Error(`Container ${id} does not exist!`)
    if (container.isLoaded)
      return container
    const data = await Repository.api.getContainer(
      id,
      this.sourceKey,
      this.envPath,
      container.fileExtension,
    )
    return plainToClass(ContentContainer, data)
  }
}

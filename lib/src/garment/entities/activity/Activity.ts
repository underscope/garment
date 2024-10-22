import type { FileKey } from '../../interfaces'
import bytes from 'bytes'
import { Exclude, plainToClass, Type } from 'class-transformer'
import omit from 'lodash/omit.js'

import sizeof from 'object-sizeof'
import { ContentContainer, Repository } from '../'

import { type GraphNodeArray, NodeType } from '../../content-graph'
import { GarmentEnv } from '../../enums'

export class Activity {
  static api: any
  static fileKeyProp: FileKey = 'id'

  isLoaded = false

  id: number
  uid: string
  parentId: number
  type: string
  position: number
  relationships: object
  meta: { [key: string]: any }

  @Type(() => Repository)
  @Exclude({ toPlainOnly: true })
  repository: Repository

  @Type(() => ContentContainer)
  contentContainers: ContentContainer[]

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  @Type(() => Date)
  publishedAt: Date

  get size(): string {
    return bytes(sizeof(this))
  }

  async load(): Promise<Activity> {
    const { contentContainers } = this
    if (contentContainers?.length) {
      const fetch = contentContainers.map(it => this.getContainer(it.sourceKey))
      await Promise
        .all(fetch)
        .then((containers) => { this.contentContainers = containers })
    }
    this.isLoaded = true
    return this
  }

  makePublic(interval?: number) {
    return Promise.all([
      ...this.contentContainers.map(it => it.makePublic(interval)),
      Activity.api.processMeta(this.meta, interval),
    ])
  }

  async getContainer(id: number | string): Promise<ContentContainer> {
    const containerManifest = this.contentContainers.find(it => it.sourceKey === id)
    if (!containerManifest)
      throw new Error (`The container '${id}' does not exist!`)
    const repositoryKey = this.repository.env === GarmentEnv.Source
      ? this.repository.sourceKey
      : this.repository.snapshotKey
    const containerData = await Activity.api.getContainer(
      id,
      repositoryKey,
      this.repository.envPath,
      containerManifest.fileExtension,
    )
    return plainToClass(ContentContainer, {
      ...containerManifest,
      ...containerData,
      isLoaded: true,
    })
  }

  getSubtreeDescriptors(): Array<GraphNodeArray> {
    const node = [this.id, this.uid, NodeType.ACTIVITY, this.parentId]
    const children = this.contentContainers?.length
      ? this.contentContainers.reduce(
        (acc, it, i) => acc.concat(it.getSubtreeDescriptors(this.id, i)),
        [] as any,
      )
      : []
    return [node, ...children]
  }

  toJSON() {
    return omit(this, ['repository'])
  }
}

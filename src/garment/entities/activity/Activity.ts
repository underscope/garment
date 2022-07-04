import bytes from 'bytes'
import isString from 'lodash/isString'
import sizeof from 'object-sizeof'
import { Type, plainToClass } from 'class-transformer'

import { ContentContainer } from '../content-container'

export class Activity {
  static api: any
  static fileKeyProp: 'id' | 'uid' = 'id'

  isLoaded = false

  id: number
  uid: string
  repositoryId: number
  type: string
  position: number
  relationships: Object
  meta: { [key: string]: any }

  @Type(() => ContentContainer)
  contentContainers: ContentContainer[]

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  @Type(() => Date)
  publishedAt: Date

  get fileKey(): string {
    const key = this[Activity.fileKeyProp]
    return isString(key) ? key : String(key)
  }

  get size(): string {
    return bytes(sizeof(this))
  }

  async load(): Promise<Activity> {
    const { contentContainers } = this
    const fetch = contentContainers.map(it => this.getContainer(it.id.toString()))
    await Promise
      .all(fetch)
      .then((containers) => { this.contentContainers = containers })
    this.isLoaded = true
    return this
  }

  makePublic() {
    return Promise.all(this.contentContainers.map(it => it.makePublic()))
  }

  async getContainer(id: string): Promise<ContentContainer> {
    const data = await Activity.api.getContainer(id, this.repositoryId.toString())
    return plainToClass(ContentContainer, data)
  }
}

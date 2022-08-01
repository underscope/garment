import bytes from 'bytes'
import omit from 'lodash/omit'
import sizeof from 'object-sizeof'
import { Type, plainToClass } from 'class-transformer'

import { ContentContainer, Repository } from '../'

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

  @Type(() => Repository)
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
    const fetch = contentContainers.map(it => this.getContainer(it.sourceKey))
    await Promise
      .all(fetch)
      .then((containers) => { this.contentContainers = containers })
    this.isLoaded = true
    return this
  }

  makePublic() {
    return Promise.all(this.contentContainers.map(it => it.makePublic()))
  }

  async getContainer(id: number | string): Promise<ContentContainer> {
    const containerSummary = this.contentContainers.find(it => it.sourceKey === id)
    if (!containerSummary) throw new Error (`The '${id}' container does not exist!`)
    const containerData = await Activity.api.getContainer(
      id,
      this.repository.sourceKey,
      this.repository.envPath,
      `${containerSummary.publishedAs}.json`)
    return plainToClass(ContentContainer, { ...containerSummary, ...containerData })
  }

  toJSON() {
    return omit(this, ['isLoaded', 'repository'])
  }
}

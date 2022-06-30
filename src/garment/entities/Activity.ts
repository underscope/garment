import bytes from 'bytes'
import sizeof from 'object-sizeof'
import { Type } from 'class-transformer'

export class Activity {
  static api: any

  isLoaded = false

  id: number
  uid: string
  repositoryId: number
  type: string
  position: number
  relationships: Object
  meta: Object
  contentContainers: any[]

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  @Type(() => Date)
  publishedAt: Date

  get fileKey() {
    return this.id.toString()
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

  getContainer(id: string) {
    return Activity.api.getContainer(id, this.repositoryId.toString())
  }
}
